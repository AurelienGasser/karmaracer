(function() {
  "use strict";

  function UserCommandManager(gameInstance) {
    this.G_userCommandCounter = 0;
    this.gameInstance = gameInstance;
    this.toAck = {};
    this.userCmdTs = Date.now();
    return this;
  }

  UserCommandManager.prototype.forwardBackward = function(action, distance, fwdForce) {
    distance = action === 'forward' ? distance : distance / 2;
    var myCar = this.gameInstance.myCar;
    var engine = this.gameInstance.engine;
    var body = engine.bodies[engine.myCarBodyId];
    var mult = action === 'forward' ? 1 : -1;
    body.accelerateWithForce(mult * distance, fwdForce);
  };

  UserCommandManager.prototype.leftRight = function(action, angle) {
    angle = action === 'left' ? -angle : angle;
    var myCar = this.gameInstance.myCar;
    var engine = this.gameInstance.engine;
    var body = engine.bodies[engine.myCarBodyId];
    body.turn(angle);
  };

  UserCommandManager.prototype.turnToAngle = function(angle) {
    var myCar = this.gameInstance.myCar;
    var engine = this.gameInstance.engine;
    var body = engine.bodies[engine.myCarBodyId];
    body.turn(angle - body.r);
  };

  UserCommandManager.prototype.generateUserCommand = function(now) {
    if (typeof this.gameInstance.clockSync.difference === 'undefined') {
      // not synced with server yet
      return;
    }
    var userCmd = new Karma.UserCommand(this.gameInstance, now);
    // don't send the same "idle" user command twice in a row
    if (userCmd.isIdle() && userCmd.isEqual(this.lastUserCmd)) {
      userCmd.active = false;
    }
    this.lastUserCmd = userCmd;
    if (userCmd.active === false) {
      return;
    }
    if (this.gameInstance.socketManager.getConnection()) {
      userCmd.seq = ++this.G_userCommandCounter;
      this.gameInstance.socketManager.getConnection().emit('user_command', userCmd);
    }
    this.toAck[userCmd.seq] = userCmd;
  };

  UserCommandManager.prototype.updatePos = function(now) {
    var config = this.gameInstance.config;
    var engine = this.gameInstance.engine;
    var body = engine.bodies[engine.myCarBodyId];
    if (!this.lastReceivedMyCar ||
      this.gameInstance.myCar === null) {
      return;
    }
    this.setMyCar(this.lastReceivedMyCar);
    for (var seq in this.toAck) {
      var userCmd = this.toAck[seq];
      var timeDelta = now - userCmd.ts;
      var fullCmdDuration = 1000 / config.userCommandsSentPerSecond;
      var isSmallDelta = timeDelta < fullCmdDuration;
      var timeSec = Math.min(timeDelta, fullCmdDuration) / 1000;
      var distance = timeSec * config.myCarSpeed;
      var angleLeftRight = timeSec * config.myCarTurnSpeed;
      var angle = userCmd.mousePos.angle;
      var fwdForce = userCmd.mousePos.force;
      this.turnToAngle(angle);
      if (userCmd.actions.left === true) {
        this.leftRight('left',  angleLeftRight);
      }
      if (userCmd.actions.right === true) {
        this.leftRight('right', angleLeftRight);
      }
      if (userCmd.actions.forward === true) {
        this.forwardBackward('forward',  distance, fwdForce);
      }
      if (userCmd.actions.backward === true) {
        this.forwardBackward('backward', distance, fwdForce);
      }
      body.doMove(isSmallDelta);
      this.gameInstance.myCar.x = body.x;
      this.gameInstance.myCar.y = body.y;
      this.gameInstance.myCar.r = body.r;
    }
    if (this.gameInstance.keyboardHandler.shoot &&
        this.gameInstance.myCar.gunLife.cur > 0) {
          var player = this.gameInstance.gameInfo[this.gameInstance.myCar.id];
          this.gameInstance.myCar.shootingWithWeapon = player.weaponName;
    } else {
      this.gameInstance.myCar.shootingWithWeapon = null;
    }
  };

  var dup = function(obj) {
    var res = {};
    for (var i in obj) {
      res[i] = obj[i];
    }
    return res;
  };

  UserCommandManager.prototype.setMyCar = function(myCar) {
    var player = this.gameInstance.gameInfo[myCar.id];
    if (typeof player === 'undefined') {
      return;
    }
    this.gameInstance.myCar = dup(myCar);
    var carImage = this.gameInstance.drawEngine.cars[player.carImageName];
    myCar.w = carImage.w;
    myCar.h = carImage.h;
    var engine = this.gameInstance.engine;
    engine.myCarBodyId = engine.replaceCarBody(myCar);
  };

  UserCommandManager.prototype.synchronizeMyCar = function(myCar) {
    if (myCar === null) {
      this.gameInstance.myCar = null;
      return;
    }
    this.gameInstance.mostUpToDateMyCarPos = {
      x: myCar.x,
      y: myCar.y,
      r: myCar.r
    };
    if (!this.gameInstance.myCar) {
      this.setMyCar(myCar);
      this.lastReceivedMyCar = dup(myCar);
    } else {
      this.lastReceivedMyCar = dup(myCar);
      for (var seq in this.toAck) {
        if (seq <= myCar.ackd) {
          delete this.toAck[seq];
        }
      }
    }
  };

  Karma.UserCommandManager_client = UserCommandManager;

}());
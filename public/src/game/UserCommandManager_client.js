(function() {
  "use strict";

  function UserCommandManager(gameInstance) {
    this.gameInstance = gameInstance;
    this.toAck = {};
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
    var userCmd = new Karma.UserCommand(this.gameInstance, now);
    if (userCmd.active === false) {
      return;
    }
    if (this.gameInstance.socketManager.getConnection()) {
      this.gameInstance.socketManager.getConnection().emit('user_command', userCmd);
    }
    this.toAck[userCmd.seq] = userCmd;
  };

  UserCommandManager.prototype.updatePos = function(now) {
    if (!this.lastReceivedMyCar ||
      this.gameInstance.myCar === null) {
      return;
    }
    this.setMyCar(this.lastReceivedMyCar);
    var config = this.gameInstance.config;
    for (var seq in this.toAck) {
      var userCmd = this.toAck[seq];
      var timeSec = Math.min(now - userCmd.ts, 1000 / config.userCommandsSentPerSecond) / 1000;
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
      var engine = this.gameInstance.engine;
      var body = engine.bodies[engine.myCarBodyId];
      body.doMove();
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
    // var diffx = myCar.x - this.gameInstance.myCar.x;
    // var diffy = myCar.y - this.gameInstance.myCar.y;
    // var diffr = myCar.r - this.gameInstance.myCar.r;
    // var diff = Math.sqrt(diffx  * diffx + diffy * diffy);
    // if (Math.abs(diff) > 0.3 ||
    //     Math.abs(diffr) > Math.PI / 8 ||
    //     Math.abs(diffr) > 2 * Math.PI - Math.PI / 8) {
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
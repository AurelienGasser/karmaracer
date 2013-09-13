(function() {
  "use strict";

  function UserCommandManager(gameInstance) {
    this.G_userCommandCounter = 0;
    this.gameInstance = gameInstance;
    this.toAck = {};
    this.userCmdTs = Date.now();
    return this;
  }

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
    var fullCmdDuration = 1000 / config.userCommandsSentPerSecond;
    var engine = this.gameInstance.engine;
    var body = engine.bodies[engine.myCarBodyId];
    if (!this.lastReceivedMyCar ||
      this.gameInstance.myCar === null) {
      return;
    }
    this.setMyCar(this.lastReceivedMyCar);
    var oldX = this.gameInstance.myCar.x;
    var oldY = this.gameInstance.myCar.y;
    var oldR = this.gameInstance.myCar.r;
    for (var seq in this.toAck) {
      var userCmd = this.toAck[seq];
      var timeDelta = now - userCmd.ts;
      var isSmallDelta = timeDelta < fullCmdDuration;
      var timeSec = Math.min(timeDelta, fullCmdDuration) / 1000;
      var distance = timeSec * config.myCarSpeed;
      var angleLeftRight = timeSec * config.myCarTurnSpeed;
      userCmd.execute(body, angleLeftRight, distance);
      body.doMove(isSmallDelta);
      this.gameInstance.myCar.x = body.x;
      this.gameInstance.myCar.y = body.y;
      this.gameInstance.myCar.r = body.r;
      var newX = this.gameInstance.myCar.x;
      var newY = this.gameInstance.myCar.y;
      var newR = this.gameInstance.myCar.r;
      if (!isSmallDelta) {
        console.log(userCmd.seq + ',' + oldX + ',' + oldY + ',' + oldR + ',' + newX + ',' + newY + ',' + newR);
      }
      oldX = this.gameInstance.myCar.x;
      oldY = this.gameInstance.myCar.y;
      oldR = this.gameInstance.myCar.r;
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
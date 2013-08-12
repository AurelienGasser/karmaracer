(function() {
  "use strict";

  function UserCommandManager(gameInstance) {
    this.gameInstance = gameInstance;
    this.toAck = {};
      // shoot: function(userCmd) {
      //   if (that.gameInstance.myCar !== null) {
      //     if (that.gameInstance.myCar.gunLife.cur > 0) {
      //       that.gameInstance.myCar.shootingWithWeapon = true;
      //     }
      //   }
      // },
    return this;
  }


  UserCommandManager.prototype.forwardBackward = function(action, distance) {
    if (this.gameInstance.myCar === null) {
      return;
    }
    distance = action === 'forward' ? distance : distance / 2;
    var myCar = this.gameInstance.myCar;
    var engine = this.gameInstance.engine;
    var body = engine.bodies[engine.myCarBodyId];
    var mult = action === 'forward' ? 1 : -1;
    body.moveToPosition = {
      x: myCar.x + mult * distance * Math.cos(myCar.r),
      y: myCar.y + mult * distance * Math.sin(myCar.r)
    };
    body.doMove();
    this.gameInstance.myCar.x = body.x;
    this.gameInstance.myCar.y = body.y;
    this.gameInstance.myCar.r = body.r;
  };

  // UserCommandManager.prototype.turn = function(userCmd) {
  //   var now = Date.now();
  //   var myCar = this.gameInstance.myCar;
  //   var isGoingBackward = (typeof this.intervals.backward !== 'undefined');
  //   var engine = this.gameInstance.engine;
  //   var body = engine.bodies[engine.myCarBodyId];
  //   var angularSpeed = this.gameInstance.config.myCarTurnSpeed;
  //   angularSpeed = userCmd.action === 'left' ? angularSpeed : -angularSpeed;
  //   angularSpeed = isGoingBackward ? angularSpeed : -angularSpeed;
  //   var angleToAdd = Karma.UserCommandUtils.getDistanceOrAngleToAdd(now, userCmd, angularSpeed);
  //   body.turn(angleToAdd);
  //   body.doMove();
  //   myCar.x = body.x;
  //   myCar.y = body.y;
  //   myCar.r = body.r;
  //   // POUET
  //   userCmd.doneTo = now;
  // };

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
    if (!this.lastReceivedMyCar) {
      return;
    }
    this.setMyCar(this.lastReceivedMyCar);
    var config = this.gameInstance.config;
    for (var seq in this.toAck) {
      var userCmd = this.toAck[seq];
      var timeSec = Math.min(now - userCmd.ts, 1000 / config.userCommandsSentPerSecond) / 1000;
      var distance = timeSec * config.myCarSpeed;
      if (userCmd.actions.forward === true) {
        this.forwardBackward('forward',  distance);
      }
      if (userCmd.actions.backward === true) {
        this.forwardBackward('backward', distance);
      }
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
        if (seq <= myCar.ack) {
          delete this.toAck[seq];
        }
      }
    }
  };

  Karma.UserCommandManager_client = UserCommandManager;

}());
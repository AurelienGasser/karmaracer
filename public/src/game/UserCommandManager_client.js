(function() {
  "use strict";

  function UserCommandManager(gameInstance) {
    this.gameInstance = gameInstance;
    this.intervals = {};
    this.actionActive = {};
    this.commandsToAck = {};
    this.currentCommands = {};
    var that = this;
    this.userCmdInnerFunctions = {
      shoot: function(userCmd) {
        if (that.gameInstance.myCar !== null) {
          if (that.gameInstance.myCar.gunLife.cur > 0) {
            that.gameInstance.myCar.shootingWithWeapon = true;
          }
        }
      },
      forward: function(userCmd) {
        that.forwardBackward(userCmd);
      },
      backward: function(userCmd) {
        that.forwardBackward(userCmd);
      },
      left: function(userCmd) {
        that.turn(userCmd);
      },
      right: function(userCmd) {
        that.turn(userCmd);
      }
    };
    return this;
  }


  UserCommandManager.prototype.forwardBackward = function(userCmd) {
    var now = Date.now();
    var speed = this.gameInstance.config.myCarSpeed;
    var distance = Karma.UserCommandUtils.getDistanceOrAngleToAdd(now, userCmd, userCmd.action === 'forward' ? speed : speed / 2);
    var myCar = this.gameInstance.myCar;
    var engine = this.gameInstance.engine;
    var body = engine.bodies[engine.myCarBodyId];
    var mult = userCmd.action === 'forward' ? 1 : -1;
    body.moveToPosition = {
      x: myCar.x + mult * distance * Math.cos(myCar.r),
      y: myCar.y + mult * distance * Math.sin(myCar.r)
    };
    body.doMove();
    this.gameInstance.myCar.x = body.x;
    this.gameInstance.myCar.y = body.y;
    this.gameInstance.myCar.r = body.r;
    userCmd.doneTo = now;
  };

  UserCommandManager.prototype.turn = function(userCmd) {
    var now = Date.now();
    var myCar = this.gameInstance.myCar;
    var isGoingBackward = (typeof this.intervals.backward !== 'undefined');
    var engine = this.gameInstance.engine;
    var body = engine.bodies[engine.myCarBodyId];
    var angularSpeed = this.gameInstance.config.myCarTurnSpeed;
    angularSpeed = userCmd.action === 'left' ? angularSpeed : -angularSpeed;
    angularSpeed = isGoingBackward ? angularSpeed : -angularSpeed;
    var angleToAdd = Karma.UserCommandUtils.getDistanceOrAngleToAdd(now, userCmd, angularSpeed);
    body.turn(angleToAdd);
    body.doMove();
    myCar.x = body.x;
    myCar.y = body.y;
    myCar.r = body.r;
    userCmd.doneTo = now;
  };

  UserCommandManager.prototype._createUserCommand = function(action, state) {
    var userCmd = new Karma.UserCommand(action, state, Date.now());
    if (this.gameInstance.socketManager.getConnection()) {
      this.gameInstance.socketManager.getConnection().emit('user_command', userCmd);
    }
    this.commandsToAck[userCmd.seqNum] = userCmd;
    this.scheduleAction(userCmd);
    return userCmd;
  };

  UserCommandManager.prototype.createUserCommand = function(action, state) {
    if (state === 'start') {
      if (this.actionActive[action] === true) {
        // don't create user command: we are already doing this action
        return;
      } else {
        this.currentCommands[action] = this._createUserCommand(action, state);
        this.actionActive[action] = true;
      }
    } else if (state === 'end') {
      this._createUserCommand(action, state);
      this.actionActive[action] = false;
      this.currentCommands[action] = null;
    }
  };

  UserCommandManager.prototype.launcher = function(userCmd) {
    var f = this.userCmdInnerFunctions[userCmd.action];
    var that = this;
    return function() {
      if (that.gameInstance.myCar !== null) {
        f(userCmd);
      }
    };
  };

  UserCommandManager.prototype.scheduleAction = function(userCmd) {
    var userCmdFun = this.launcher(userCmd);
    if (userCmd.state === 'start') {
      if (userCmd.action === 'shoot') {
        userCmdFun();
      } else {
        userCmdFun();
        this.intervals[userCmd.action] = setInterval(userCmdFun, 1000 / this.gameInstance.config.userCommandRepeatsPerSecond);
      }
    } else if (userCmd.state === 'end') {
      if (userCmd.action === 'shoot') {
        this.gameInstance.myCar.shootingWithWeapon = false;
      } else {
        this.cancelUserCommand(userCmd.action);
      }
    }
  };

  UserCommandManager.prototype.cancelUserCommand = function(action) {
    this.userCmdInnerFunctions[action](this.currentCommands[action]);
    this.actionActive[action] = false;
    clearInterval(this.intervals[action]);
    delete this.intervals[action];
    this.currentCommands[action] = null;
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
    var that = this;
    function updateBody() {
      var player = that.gameInstance.gameInfo[myCar.id];
      if (typeof player === 'undefined') {
        // we don't have enough data to draw this car
        return;
      }
      var carImage = that.gameInstance.drawEngine.cars[player.carImageName];
      myCar.w = carImage.w;
      myCar.h = carImage.h;

      var engine = that.gameInstance.engine;
      engine.myCarBodyId = engine.replaceCarBody(myCar);
    }
    if (this.gameInstance.myCar !== null) {
      var diffx = myCar.x - this.gameInstance.myCar.x;
      var diffy = myCar.y - this.gameInstance.myCar.y;
      var diffr = myCar.r - this.gameInstance.myCar.r;
      var diff = Math.sqrt(diffx  * diffx + diffy * diffy);
      if (Math.abs(diff) > 0.3 ||
          Math.abs(diffr) > Math.PI / 8 ||
          Math.abs(diffr) > 2 * Math.PI - Math.PI / 8) {
        this.gameInstance.myCar = myCar;
        updateBody();
      }
    } else {
      this.gameInstance.myCar = myCar;
      updateBody();
    }
    // replay user cmds
    for (var seqNumToAck in this.commandsToAck) {
      var commandToAck = this.commandsToAck[seqNumToAck];
      var commandAck = myCar.ack[commandToAck.action];
      if (typeof commandAck === 'undefined') {
        // not ack yet
      } else {
        if (commandToAck.seqNum < commandAck.seqNum) {
          // action finished
          delete this.commandsToAck[seqNumToAck];
        } else if (commandToAck.seqNum == commandAck.seqNum) {
          // not finished
        } else {
          // command not ackd yet
        }
      }
    }
    var snapAck = myCar.ack;
  };

  Karma.UserCommandManager_client = UserCommandManager;

}());
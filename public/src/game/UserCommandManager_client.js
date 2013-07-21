(function() {
  "use strict";

  function UserCommandManager(gameInstance) {
    this.gameInstance = gameInstance;
    this.intervals = {};
    this.actionActive = {};
    this.commandsToAck = {};
    var that = this;
    this.userCmdInnerFunctions = {
      shoot: function() {
        if (typeof that.gameInstance.myCar !== 'undefined') {
          if (that.gameInstance.myCar.gunLife.cur > 0) {
            that.gameInstance.myCar.shootingWithWeapon = true;
          }
        }
        // this.gameInstance.socketManager.getConnection().emit('shoot', state);
      },
      forward: function() {
        that.myCarAccelerate(that.gameInstance.config.myCarSpeed);
      },
      backward: function() {
        that.myCarAccelerate(-that.gameInstance.config.myCarSpeed / 2);
      },
      left: function() {
        var isGoingBackward = (typeof that.intervals.backward !== 'undefined');
        that.myCarTurn(that.gameInstance.config.myCarTurnSpeed, isGoingBackward);
      },
      right: function() {
        var isGoingBackward = (typeof that.intervals.backward !== 'undefined');
        that.myCarTurn(that.gameInstance.config.myCarTurnSpeed, -isGoingBackward);
      }
    };
    return this;
  }


  UserCommandManager.prototype.myCarAccelerate = function(speed) {
    var myCar = this.gameInstance.myCar;
    var engine = this.gameInstance.engine;
    var body = engine.bodies[engine.myCarBodyId];
    body.moveToPosition = {
      x: myCar.x + speed * Math.cos(myCar.r),
      y: myCar.y + speed * Math.sin(myCar.r)
    };
    body.doMove();
  };

  UserCommandManager.prototype.myCarTurn = function(speed, isTurningLeft) {
    var myCar = this.gameInstance.myCar;
    myCar.r += isTurningLeft ? 1 : -1 * speed;
  };

  UserCommandManager.prototype._createUserCommand = function(action, state) {
    var userCmd = new Karma.UserCommand(action, state, Date.now());
    if (this.gameInstance.socketManager.getConnection()) {
      this.gameInstance.socketManager.getConnection().emit('user_command', userCmd);
    }
    this.commandsToAck[userCmd.seqNum] = userCmd;
    this.executeUserCommand_create(userCmd);
  };

  UserCommandManager.prototype.createUserCommand = function(action, state) {
    if (state === 'start') {
      if (this.actionActive[action] === true) {
        // don't create user command: we are already doing this action
        return;
      } else {
        this._createUserCommand(action, state);
        this.actionActive[action] = true;
      }
    } else if (state === 'end') {
      this._createUserCommand(action, state);
      this.actionActive[action] = false;
    }
  };

  UserCommandManager.prototype.launcher = function(userCmd) {
    var f = this.userCmdInnerFunctions[userCmd.action];
    return function() {
      f();
      ++userCmd.iteration;
    };
  };

  UserCommandManager.prototype.executeUserCommand_create = function(userCmd) {
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
    this.actionActive[action] = false;
    clearInterval(this.intervals[action]);
    delete this.intervals[action];
  };

  UserCommandManager.prototype.synchronizeMyCar = function(myCar) {
    if (typeof this.gameInstance.myCar !== 'undefined') {
      var diffx = myCar.x - this.gameInstance.myCar.x;
      var diffy = myCar.y - this.gameInstance.myCar.y;
      var diff = Math.sqrt(diffx  * diffx + diffy * diffy).toFixed(1);
      // console.log('error: ', diffx.toFixed(1));
    }
    this.gameInstance.myCar = myCar;
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
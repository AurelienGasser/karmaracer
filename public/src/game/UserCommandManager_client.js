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
        that.gameInstance.myCar.shootingWithWeapon = true;
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
    myCar.x += speed * Math.cos(myCar.r);
    myCar.y += speed * Math.sin(myCar.r);
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
  }

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
    }
  }

  UserCommandManager.prototype.executeUserCommand_create = function(userCmd) {
    if (userCmd.state === 'start') {
      var userCmdFun = this.launcher(userCmd);
      userCmdFun();
      this.intervals[userCmd.action] = setInterval(userCmdFun, 1000 / this.gameInstance.config.userCommandRepeatsPerSecond);
    } else if (userCmd.state === 'end') {
      this.cancelUserCommand(userCmd.action);
    }
  };

  UserCommandManager.prototype.executeUserCommand = function(userCmd, iterations) {
    if (userCmd.state === 'start') {
      var userCmdFun = this.launcher(userCmd);
      if (iterations > 0) {
        for (var i = 0; i < iterations - 1; ++i) {
          userCmdFun();
        }
      }
      if (typeof this.intervals[userCmd.action] === 'undefined') {
        console.log('create interval ' + userCmd.action)
        userCmdFun();
        this.intervals[userCmd.action] = setInterval(userCmdFun, 1000 / this.gameInstance.config.userCommandRepeatsPerSecond);
      } else {
        // do nothing, this action is already schedules to be performed
        // we reach this case because of keyboard repetition
        console.log(iterations + ' iterations')
        if (iterations > 0) {
          for (var i in this.commandsToAck) {
            var toAck = this.commandsToAck[i];
            console.log(userCmd.action+ ' ' + userCmd.state + ' vs ' + toAck.action + ' ' + toAck.state)
            if (toAck.action === userCmd.action && toAck.state === 'start') {
              console.log('add ' + iterations + ' iterations')
              toAck.iteration += iterations;
            }
          }
        }
      }
    } else if (userCmd.state === 'end') {
      this.cancelUserCommand(userCmd.action);
    }
  };

  UserCommandManager.prototype.cancelUserCommand = function(action) {
    this.actionActive[action] = false;
    clearInterval(this.intervals[action]);
    delete this.intervals[action];
  };

  UserCommandManager.prototype.synchronizeMyCar = function(myCar) {
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
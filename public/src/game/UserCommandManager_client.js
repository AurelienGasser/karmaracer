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
        if (that.gameInstance.myCar !== null) {
          if (that.gameInstance.myCar.gunLife.cur > 0) {
            that.gameInstance.myCar.shootingWithWeapon = true;
          }
        }
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
        that.myCarTurn(-that.gameInstance.config.myCarTurnSpeed, isGoingBackward);
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
    this.gameInstance.myCar.x = body.x;
    this.gameInstance.myCar.y = body.y;
    this.gameInstance.myCar.r = body.r;
  };

  UserCommandManager.prototype.myCarTurn = function(speed, isTurningLeft) {
    var myCar = this.gameInstance.myCar;
    myCar.r += (isTurningLeft ? 1 : -1) * speed;
  };

  UserCommandManager.prototype._createUserCommand = function(action, state) {
    var userCmd = new Karma.UserCommand(action, state, Date.now());
    if (this.gameInstance.socketManager.getConnection()) {
      this.gameInstance.socketManager.getConnection().emit('user_command', userCmd);
    }
    this.commandsToAck[userCmd.seqNum] = userCmd;
    this.scheduleAction(userCmd);
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
    var that = this;
    return function() {
      if (that.gameInstance.myCar !== null) {
        f();
        ++userCmd.iteration;
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
    this.actionActive[action] = false;
    clearInterval(this.intervals[action]);
    delete this.intervals[action];
  };

  UserCommandManager.prototype.synchronizeMyCar = function(myCar) {
    if (myCar === null) {
      this.gameInstance.myCar = null;
      return;
    }
    if (this.gameInstance.myCar !== null) {
      var diffx = myCar.x - this.gameInstance.myCar.x;
      var diffy = myCar.y - this.gameInstance.myCar.y;
      var diff = Math.sqrt(diffx  * diffx + diffy * diffy);
      // console.log('error: ', diffx.toFixed(2));
    }
    this.gameInstance.myCar = myCar;
    var engine = this.gameInstance.engine;
    var body = engine.bodies[engine.myCarBodyId];
    if (body) {
      body.x = myCar.x;
      body.y = myCar.y;
      body.r = myCar.r;
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
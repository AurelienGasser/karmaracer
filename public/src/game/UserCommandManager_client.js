var forcount = 0;
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
    engine.bodies[engine.myCarBodyId].oldPos = {
      x : body.x,
      y : body.y,
      r : body.r
    };
    body.accelerate(this.gameInstance.config.myCarSpeed);
    console.log(this.gameInstance.drawEngine.fps);

    var sps = this.gameInstance.socketManager.lastSocketCounter;
    var fps = this.gameInstance.drawEngine.fps;

    var deltaX = body.moveToPosition.x = body.x;
    var ratio = this.gameInstance.lastSyncCounter - this.gameInstance.syncCounter;
    this.gameInstance.deltaX = this.gameInstance.config.myCarSpeed / ratio;
    this.gameInstance.ratioCounter = 0;
    // console.log(body.oldPos, 'sps', sps, fps, 'deltaX',deltaX, ratio, this.gameInstance.deltaX, 'mov to x', body.moveToPosition.x, body.x);
    console.log('ratio', ratio, this.gameInstance.deltaX);



    // body.doMove();
    // this.gameInstance.myCar.x = body.x;
    // this.gameInstance.myCar.y = body.y;
    // console.log(++forcount + ' ' + (Date.now() % 1000));
  };

  UserCommandManager.prototype.myCarTurn = function(speed, isTurningLeft) {
    // var myCar = this.gameInstance.myCar;
    // myCar.r += (isTurningLeft ? 1 : -1) * speed;
    var side = (isTurningLeft ? 1 : -1);
    var engine = this.gameInstance.engine;
    var body = engine.bodies[engine.myCarBodyId];
    body.turn(side);

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
        this.actionActive[action] = true;
        this._createUserCommand(action, state);
      }
    } else if (state === 'end') {
      this.actionActive[action] = false;
      this._createUserCommand(action, state);
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
      // console.log('start' + ' ' + (Date.now() % 1000));
      if (userCmd.action === 'shoot') {
        userCmdFun();
      } else {
        userCmdFun();
        // this.intervals[userCmd.action] = setInterval(userCmdFun, 1000 / this.gameInstance.config.userCommandRepeatsPerSecond);
      }
    } else if (userCmd.state === 'end') {
      // console.log('end' + ' ' + (Date.now() % 1000));
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

  var pouet = 0;
  UserCommandManager.prototype.synchronizeMyCar = function(myCar) {
    if (pouet % 10 === 0) {
      console.log('synchronize');

      this.gameInstance.lastSyncCounter = this.gameInstance.syncCounter;
      this.gameInstance.syncCounter = 0;
      this.gameInstance.deltaX = 0;
      this.gameInstance.bodyRatioStartPosition = {x : myCar.x, y : myCar.y, r:0};

      if (myCar === null) {
        this.gameInstance.myCar = null;
        return;
      }
      // if (this.gameInstance.myCar !== null) {
      //   var diffx = myCar.x - this.gameInstance.myCar.x;
      //   var diffy = myCar.y - this.gameInstance.myCar.y;
      //   var diff = Math.sqrt(diffx  * diffx + diffy * diffy).toFixed(1);
      //   // console.log('error: ', diffx.toFixed(1));
      // }
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

    }
    ++pouet;
  };

  Karma.UserCommandManager_client = UserCommandManager;

}());
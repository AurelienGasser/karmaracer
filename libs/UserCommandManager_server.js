var config = require('../config');
var ucu = require('./classes/UserCommandUtils');

var UserCommandManager = function(client) {
  this.client = client;
  this.intervals = {};
  this.userCmds = {};
  var that = this;
  this.toAck = {};
  this.userCmdInnerFunctions = {
    shoot: function(userCmd, car) {
      car.playerCar.shoot();
    },
    forward: function(userCmd, car) {
      that.forwardBackward(userCmd, car)
    },
    backward: function(userCmd, car) {
      that.forwardBackward(userCmd, car)
    },
    left: function(userCmd, car) {
      that.turn(userCmd, car);
    },
    right: function(userCmd, car) {
      that.turn(userCmd, car);
    },
  };
  return this;
}

UserCommandManager.prototype.forwardBackward = function(userCmd, car) {
  var now = Date.now();
  var distance = ucu.getDistanceOrAngleToAdd(now, userCmd, config.myCarSpeed);
  distance = userCmd.action === 'forward' ? distance : -distance / 2;
  car.accelerate(distance);
  userCmd.doneTo = now;
}

UserCommandManager.prototype.turn = function(userCmd, car) {
  var now = Date.now();
  var isGoingBackward = (typeof this.intervals.backward !== 'undefined');
  var angularSpeed = config.myCarTurnSpeed;
  angularSpeed = userCmd.action === 'left' ? angularSpeed : -angularSpeed;
  angularSpeed = isGoingBackward ? angularSpeed : -angularSpeed;
  var angleToAdd = ucu.getDistanceOrAngleToAdd(now, userCmd, angularSpeed);
  car.turn(angleToAdd);
  userCmd.doneTo = now;
}

UserCommandManager.prototype.updateAck = function(userCmd) {
  if (typeof this.toAck[userCmd.action] !== 'undefined') {
    if (this.toAck[userCmd.action].seqNum < userCmd.seqNum) {
      this.toAck[userCmd.action] = userCmd;
    }
  } else {
    this.toAck[userCmd.action] = userCmd;
  }
}

UserCommandManager.prototype.onUserCmdReceived = function(userCmd) {
  if (userCmd.state === 'start' && typeof this.intervals[userCmd.action] === 'undefined') {
    var now = Date.now();
    userCmd.doneTo = now;
    var userCmdFun = this.userCommandLauncher(userCmd);
    userCmdFun();
    this.intervals[userCmd.action] = setInterval(userCmdFun, 1000 / config.userCommandRepeatsPerSecond);
    this.userCmds[userCmd.action] = userCmd;
    this.updateAck(userCmd);
  } else if (userCmd.state === 'end') {
    this.cancelUserCommand(userCmd.action);
    this.updateAck(userCmd);
  }
}

UserCommandManager.prototype.userCommandLauncher = function(userCmd) {
  var client = this.client;
  var userCmdInnerFun = this.userCmdInnerFunctions[userCmd.action];
  var that = this;
  return function() {
    if (typeof client.player !== 'undefined' &&
        typeof client.player.playerCar !== 'undefined' &&
        !client.player.playerCar.dead &&
        typeof client.player.playerCar.car !== 'undefined' &&
        typeof client.gameServer !== 'undefined' &&
        client.gameServer.doStep) {
          var car = client.player.playerCar.car;
          userCmdInnerFun(userCmd, car);
    } else {
      // player car is not ready for executing user command
      if (typeof that.intervals[userCmd.action] !== 'undefined') {
        that.cancelUserCommand(userCmd.action);
      }
    }
  }
}

UserCommandManager.prototype.cancelUserCommand = function(action) {
  var car = this.client.player.playerCar.car;
  this.userCmds[action].stopServerTs = Date.now();
  this.userCmdInnerFunctions[action](this.userCmds[action], car);
  clearInterval(this.intervals[action]);
  delete this.intervals[action];
  delete this.userCmds[action];
  if (action == 'shoot' && this.client.player && this.client.player.playerCar) {
    this.client.player.playerCar.weaponShootOff();
  }
}

UserCommandManager.prototype.cancelAllUserCommands = function() {
  for (var action in this.intervals) {
    this.cancelUserCommand(action);
  }
}

module.exports = UserCommandManager;
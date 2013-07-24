var config = require('../config');

var UserCommandManager = function(client) {
  this.client = client;
  this.intervals = {};
  var that = this;
  this.toAck = {};
  this.userCmdInnerFunctions = {
    shoot: function(car) {
      car.playerCar.shoot();
    },
    forward: function(car) {
      car.accelerate(config.myCarSpeed);
    },
    backward: function(car) {
      car.accelerate(-config.myCarSpeed / 2);
    },
    left: function(car) {
      var isGoingBackward = (typeof that.intervals.backward !== 'undefined');
      car.turn(isGoingBackward);
    },
    right: function(car) {
      var isGoingBackward = (typeof that.intervals.backward !== 'undefined');
      car.turn(!isGoingBackward);
    },
  };
  return this;
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
    var userCmdFun = this.userCommandLauncher(userCmd);
    // console.log('start', (Date.now() % 1000))
    userCmdFun();
    // this.intervals[userCmd.action] = setInterval(userCmdFun, 1000 / config.userCommandRepeatsPerSecond);
    this.updateAck(userCmd);
  } else if (userCmd.state === 'end') {
    // console.log('end', (Date.now() % 1000))
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
          userCmdInnerFun(car);
          ++userCmd.iteration;
    } else {
      // player car is not ready for executing user command
      if (typeof that.intervals[userCmd.action] !== 'undefined') {
        that.cancelUserCommand(userCmd.action);
      }
    }
  }
}

UserCommandManager.prototype.cancelUserCommand = function(action) {
  clearInterval(this.intervals[action]);
  delete this.intervals[action];
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
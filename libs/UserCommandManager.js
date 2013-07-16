var config = require('../config');

var UserCommandManager = function(client) {
  this.client = client;
  this.intervals = {};
  var that = this;
  this.userCmdInnerFunctions = {
    shoot: function(car) {
      car.playerCar.shoot();
    },
    forward: function(car) {
      car.accelerate(0.1);
    },
    backward: function(car) {
      car.accelerate(-0.05);
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

UserCommandManager.prototype.onUserCmdReceived = function(userCmd) {
  if (userCmd.state === 'start') {
    if (typeof this.intervals[userCmd.action] === 'undefined') {
      var userCmdFun = this.userCommandLauncher(userCmd);
      userCmdFun();
      this.intervals[userCmd.action] = setInterval(userCmdFun, 1000 / config.userCommandRepeatsPerSecond);
    } else {
      // do nothing, this action is already schedules to be performed
      // we reach this case because of keyboard repetition
    }
  } else if (userCmd.state === 'end') {
    this.cancelUserCommand(userCmd.action);
  }
}

UserCommandManager.prototype.userCommandLauncher = function(userCmd) {
  var client = this.client;
  var userCmdInnerFun = this.userCmdInnerFunctions[userCmd.action];
  return function() {
    if (typeof client.player !== 'undefined' &&
        typeof client.player.playerCar !== 'undefined' &&
        !client.player.playerCar.dead &&
        typeof client.player.playerCar.car !== 'undefined' &&
        typeof client.gameServer !== 'undefined' &&
        client.gameServer.doStep) {
          var car = client.player.playerCar.car;
          userCmdInnerFun(car);
    } else {
      // player car is not ready for executing user command
      if (typeof this.intervals[userCmd.action] !== 'undefined') {
        cancelUserCommand(userCmd.action);
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
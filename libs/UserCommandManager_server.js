var config = require('../config');
var ucu = require('./classes/UserCommandUtils');

var UserCommandManager = function(client) {
  this.client = client;
  return this;
}

UserCommandManager.prototype.forwardBackward = function(userCmd, action) {
  var client = this.client;
  if (typeof client.player !== 'undefined' &&
      typeof client.player.playerCar !== 'undefined' &&
      !client.player.playerCar.dead &&
      typeof client.player.playerCar.car !== 'undefined' &&
      typeof client.gameServer !== 'undefined' &&
      client.gameServer.doStep) {
        var car = client.player.playerCar.car;
        var distance = config.myCarSpeed / config.userCommandsSentPerSecond;
        distance = action === 'forward' ? distance : -distance / 2;
        car.accelerate(distance);
  } else {
    // player car is not ready for executing user command
  }
}

UserCommandManager.prototype.tryForwardBackward = function(userCmd, action) {
  var now = Date.now();
  var that = this;
  if (now < userCmd.ts + 1000 / config.userCommandsSentPerSecond) {
    // don't execute the command before it is finished
    process.nextTick(function() {
      that.tryForwardBackward.bind(that)(userCmd, action);
    })
  } else {
    this.forwardBackward(userCmd, action);
    this.toAck = userCmd.seq;
  }
}

UserCommandManager.prototype.receivedUserCmd = function(userCmd) {
  if (userCmd.seq < this.currentSeq) {
    // user commands overlapped: dismiss obsolete command
    return;
  }
  this.currentSeq = userCmd.seq;
  if (userCmd.actions.forward) {
    this.tryForwardBackward(userCmd, 'forward');
  }
  if (userCmd.actions.backward) {
    this.tryForwardBackward(userCmd, 'backward');
  }
}

module.exports = UserCommandManager;
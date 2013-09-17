var config = require('../config');
var UserCommand = require('./classes/UserCommand');

var UserCommandManager = function(client) {
  this.client = client;
  return this;
}

UserCommandManager.prototype.delayExecution = function(userCmd) {
  var that = this;
  process.nextTick(function() {
    that.tryExecute.bind(that)(userCmd);
  })
}

UserCommandManager.prototype.tryExecute = function(userCmd) {
  var now = Date.now();
  var ts = userCmd.ts + userCmd.clockSyncDifference;
  if (now < ts + 1000 / config.userCommandsSentPerSecond) {
    // don't execute the command before it is finished
    this.delayExecution(userCmd);
    return;
  }
  this.execute(userCmd);
}

UserCommandManager.prototype.execute = function(userCmd) {
  var client = this.client;
  var player = client.player;
  var body = player.playerCar.car;
  var angle2 = config.myCarTurnSpeed / config.userCommandsSentPerSecond;
  var distance = config.myCarSpeed / config.userCommandsSentPerSecond;
  if (typeof player !== 'undefined' &&
      typeof player.playerCar !== 'undefined' &&
      !player.playerCar.dead &&
      typeof player.playerCar.car !== 'undefined' &&
      typeof client.gameServer !== 'undefined' &&
      client.gameServer.doStep) {
        UserCommand.prototype.execute.bind(userCmd)(body, angle2, distance);
  } else {
    // player car is not ready for executing user command
  }
  this.toAck = userCmd.seq;
}

UserCommandManager.prototype.receivedUserCmd = function(userCmd) {
  if (userCmd.seq < this.currentSeq) {
    // user commands overlapped: dismiss obsolete command
    return;
  }
  this.currentSeq = userCmd.seq;
  this.tryExecute(userCmd);
  if (userCmd.actions.shoot) {
    var playerCar = this.client.player.playerCar;
    if (!playerCar.dead) {
      playerCar.shoot();
    }
  }
}

module.exports = UserCommandManager;
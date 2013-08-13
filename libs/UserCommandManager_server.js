var config = require('../config');
var ucu = require('./classes/UserCommandUtils');

var UserCommandManager = function(client) {
  this.client = client;
  return this;
}

UserCommandManager.prototype.forwardBackward = function(userCmd, action, fwdForce) {
  var car = this.client.player.playerCar.car;
  var distance = config.myCarSpeed / config.userCommandsSentPerSecond;
  distance = action === 'forward' ? distance : -distance / 2;
  car.accelerateWithForce(distance, fwdForce);
}

UserCommandManager.prototype.leftRight = function(userCmd, action) {
  var car = this.client.player.playerCar.car;
  var angle = config.myCarTurnSpeed / config.userCommandsSentPerSecond;
  angle = action === 'left' ? -angle : angle;
  car.turn(angle);
}

UserCommandManager.prototype.turnToAngle = function(angle) {
  var car = this.client.player.playerCar.car;
  car.turn(angle - car.r);
}

UserCommandManager.prototype.tryExecute = function(userCmd, action, fwdForce) {
  var now = Date.now();
  var that = this;
  if (now < userCmd.ts + 1000 / config.userCommandsSentPerSecond) {
    // don't execute the command before it is finished
    process.nextTick(function() {
      that.tryExecute.bind(that)(userCmd, action, fwdForce);
    })
  } else {
    var client = this.client;
    var player = client.player;
    if (typeof player !== 'undefined' &&
        typeof player.playerCar !== 'undefined' &&
        !player.playerCar.dead &&
        typeof player.playerCar.car !== 'undefined' &&
        typeof client.gameServer !== 'undefined' &&
        client.gameServer.doStep) {
          switch (action) {
            case 'forward':
            case 'backward':
              this.forwardBackward(userCmd, action, fwdForce);
              break;
            case 'left':
            case 'right':
              this.leftRight(userCmd, action);
              break;
            default:
              console.error('Error: uncaught action', userCmd);
              break;
          }
    } else {
      // player car is not ready for executing user command
    }
    this.toAck = userCmd.seq;
  }
}

UserCommandManager.prototype.receivedUserCmd = function(userCmd) {
  if (userCmd.seq < this.currentSeq) {
    // user commands overlapped: dismiss obsolete command
    return;
  }
  this.currentSeq = userCmd.seq;
  var fwdForce = userCmd.mousePos.force;
  var angle = userCmd.mousePos.angle;
  this.turnToAngle(angle);
  if (userCmd.actions.left) {
    this.tryExecute(userCmd, 'left');
  }
  if (userCmd.actions.right) {
    this.tryExecute(userCmd, 'right');
  }
  if (userCmd.actions.forward) {
    this.tryExecute(userCmd, 'forward', fwdForce);
  }
  if (userCmd.actions.backward) {
    this.tryExecute(userCmd, 'backward', fwdForce);
  }
  if (userCmd.actions.shoot) {
    var playerCar = this.client.player.playerCar;
    if (!playerCar.dead) {
      playerCar.shoot();
    }
  }
}

module.exports = UserCommandManager;
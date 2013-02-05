var PlayerCar = require('./PlayerCar');

var Bot = function(gameServer, id) {
  this.id = id;
  this.isBot = true;
  this.gameServer = gameServer;
  this.name = 'bot_' + this.id;
  this.playerCar = new PlayerCar(this.gameServer, null, this.name, this);
  return this;
}

Bot.prototype.tick = function() {
  var numAdditionalTicksToTurn = 20;
  if (this.playerCar.car) {
    if (this.sensor || this.sensorTicksSinceEnd < numAdditionalTicksToTurn) {
      this.sensorTicksSinceEnd++;
      if (this.sensorTicksSinceEnd != numAdditionalTicksToTurn) {
        // console.log('turn', this.sensorTicksSinceEnd)
        this.playerCar.car.stop();
        this.playerCar.car.turn(2);
      } else {
        // console.log('stop turning')
        this.playerCar.car.stop();
      }
    } else {
      if (this.playerCar.car.body.GetLinearVelocity().Length() < 20) {
        this.playerCar.car.accelerate(0.03);
      }
      if (this.playerCar.car.body.GetAngularVelocity() > 1) {
        // console.log('turning too fast: reduce velocity')
        this.playerCar.car.turn(-1);
      } else if (this.playerCar.car.body.GetAngularVelocity() < -1) {
        // console.log('turning too fast: reduce velocity')
        this.playerCar.car.turn(1);
      }
    }
  }
}

Bot.prototype.sensorBegin = function() {
  this.sensor = true;
  this.playerCar.car.stop();
}

Bot.prototype.sensorEnd = function() {
  this.sensor = false;
  this.sensorTicksSinceEnd = 0;
  this.playerCar.car.stop();
}

module.exports = Bot;
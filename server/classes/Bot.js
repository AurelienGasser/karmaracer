var PlayerCar = require('./PlayerCar');

var Bot = function(gameServer, id) {
    this.id = id;
    this.isBot = true;
    this.gameServer = gameServer;
    this.name = this.id + ' (bot)';
    this.playerCar = new PlayerCar(this.gameServer, null, this.name, this);
    return this;
  }

Bot.prototype.tick = function() {
  var numAdditionalTicksToTurn = 20;
  if(this.playerCar.car) {
    var car = this.playerCar.car;
    var sensorDelta = car.getVector(2);
    var sensor = car.addVectors(car, sensorDelta);
    if (!this.isTurning && car.tryPosition(sensor)) {
      car.accelerate(0.1)
    } else {
      if (this.isTurning) {
        --this.isTurning
      } else {
        this.isTurning = 20;
      }
      car.turn(0.15)
    }
    // this.playerCar.shoot();
    // shoot for 30 ticks once every 50 ticks
    // if(this.isShooting) {
    //   if(!--this.shootCpt) {
    //     this.isShooting = false;
    //   } else {
    //     // this.playerCar.shoot();
    //   }
    // } else {
    //   if(!this.sensor && Math.random() * 50 < 1) {
    //     this.isShooting = true;
    //     this.shootCpt = 50;
    //   }
    // }
  }
}

Bot.prototype.sensorBegin = function() {
  this.sensor = true;
  if(this.playerCar.car !== null) {
    this.playerCar.car.stop();
  }
}

Bot.prototype.sensorEnd = function() {
  this.sensor = false;
  this.sensorTicksSinceEnd = 0;
  if(this.playerCar.car !== null) {
    this.playerCar.car.stop();
  }
}

module.exports = Bot;
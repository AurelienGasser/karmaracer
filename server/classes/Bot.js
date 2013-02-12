var PlayerCar = require('./PlayerCar');

var Bot = function(gameServer, id) {
    this.id = id;
    this.isBot = true;
    this.gameServer = gameServer;
    this.name = this.id + ' (bot)';
    this.playerCar = new PlayerCar(this.gameServer, null, this.name, this);
    return this;
  }

Bot.prototype.initCar = function() {
  this.playerCar = new PlayerCar(this.gameServer, null, this.name, this);
}


Bot.prototype.tick = function() {
  var numAdditionalTicksToTurn = 20;
  if(this.playerCar.car) {
    if(this.sensor || this.sensorTicksSinceEnd < numAdditionalTicksToTurn) {
      // turn
      this.sensorTicksSinceEnd++;
      if(this.sensorTicksSinceEnd != numAdditionalTicksToTurn) {
        this.playerCar.car.stop();
        this.playerCar.car.turn(2);
      } else {
        // console.log('stop turning')
        this.playerCar.car.stop();
      }
    } else {
      // go forward
      if(this.playerCar.car.body.GetLinearVelocity().Length() < 20) {
        this.playerCar.car.accelerate(0.03);
      }
      if(this.playerCar.car.body.GetAngularVelocity() > 1) {
        // console.log('turning too fast: reduce velocity')
        this.playerCar.car.turn(-1);
      } else if(this.playerCar.car.body.GetAngularVelocity() < -1) {
        // console.log('turning too fast: reduce velocity')
        this.playerCar.car.turn(1);
      }
    }
    this.playerCar.shoot();
    // shoot for 30 ticks once every 50 ticks
    if(this.isShooting) {
      if(!--this.shootCpt) {
        this.isShooting = false;
      } else {
        this.playerCar.shoot();
      }
    } else {
      if(!this.sensor && Math.random() * 50 < 1) {
        this.isShooting = true;
        this.shootCpt = 50;
      }
    }
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
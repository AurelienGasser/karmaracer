var PlayerCar = require('./PlayerCar');

var Bot = function(gameServer, id) {
    this.id = id;
    this.isBot = true;
    this.gameServer = gameServer;
    this.name = this.id + ' (bot)';
    this.playerCar = new PlayerCar(this.gameServer, null, this.name, this);
    this.playerCar.car.name = 'bot';
    this.playerCar.car.collide = this.collide;
    return this;
  }

Bot.prototype.tick = function() {
  var numAdditionalTicksToTurn = 20;
  var maxRandom = 5;
  var diff = 2;
  if(this.playerCar.car) {
    var car = this.playerCar.car;

    var random = parseInt(Math.random() * maxRandom, 10);
    if(random < diff) {
      car.turn(true);
    }
    car.accelerate(0.5);
    if(random === 0) {
      this.playerCar.shoot();
    }
  }
}

Bot.prototype.collide = function(oldPosition) {
  // console.log(this.name, 'collide');
  this.x = oldPosition.x;
  this.y = oldPosition.y;
  this.r = oldPosition.r + Math.PI / 8;
  return true;
}

module.exports = Bot;
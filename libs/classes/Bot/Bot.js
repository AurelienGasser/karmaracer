var PlayerCar = require('./../PlayerCar');

var Bot = function(gameServer, name) {
    this.isBot = true;
    this.gameServer = gameServer;
    this.name = name + ' (bot)';
    this.playerCar = new PlayerCar(this.gameServer, null, this.name, this);
    this.playerCar.car.collide = this.collide;
    this.playerCar.playerName = this.name;
    var maxCar = 4;
    var r = parseInt((Math.random() * 1e5) % maxCar, 10);
    r += 2;
    this.playerCar.car.carImageName = 'c' + r;
    this.id = this.playerCar.id;


    return this;
  }

Bot.prototype.tick = function() {
  var numAdditionalTicksToTurn = 20;
  var maxRandom = 5;
  var diff = 1;
  if(this.playerCar.car && !this.playerCar.dead) {
    var car = this.playerCar.car;
    var random = parseInt(Math.random() * maxRandom, 10);
    if(random < diff) {
      var turnLeft = (Math.random() - 0.5 > 0 ? 1 : -1);
      var angle = turnLeft * Math.PI / 4
      car.accelerateAndTurn(0.5, angle);
      car.playerCar.shoot();
    } else {
      car.accelerate(0.5);
    }
  }
}

module.exports = Bot;
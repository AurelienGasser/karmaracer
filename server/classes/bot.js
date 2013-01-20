var Car = require('./physicsEngine/car');

var Bot = function(gameServer) {
  this.gameServer = gameServer;
  this.car = new Car(this.gameServer.physicsEngine);
  this.gameServer.addCar(this.car);
}

module.exports = Bot;
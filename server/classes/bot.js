var Car = require('./PhysicsEngine/Car');

var Bot = function(gameServer) {
  this.gameServer = gameServer;
  this.car = new Car(this.gameServer.physicsEngine);
  this.gameServer.addCar(this.car);
}

module.exports = Bot;
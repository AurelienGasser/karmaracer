var Car = require('./PhysicsEngine/Car');

var PlayerCar = function(physicsEngine, client, playerName) {
  this.car = new Car(physicsEngine, client, playerName);
}

module.exports = PlayerCar;
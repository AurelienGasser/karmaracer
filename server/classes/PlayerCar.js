var Car = require('./PhysicsEngine/Car');

var PlayerCar = function(physicsEngine, client, playerName) {
  this.car = new Car(physicsEngine, client, playerName, this);
}

PlayerCar.prototype.getShared = function() {
  return this.car.getShared();
}

PlayerCar.prototype.updatePos = function() {
  return this.car.updatePos();
}

module.exports = PlayerCar;
var Car = require('./PhysicsEngine/Car');

var Player = function(client, playerName) {
  this.client = client;
  this.playerName = playerName;
}

Player.prototype.initCar = function(physicsEngine) {
  this.car = new Car(physicsEngine, this.client, this.playerName);
}

module.exports = Player;
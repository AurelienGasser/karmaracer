var PlayerCar = require('./PlayerCar');
var Car = require('./PhysicsEngine/Car');

var Player = function(client, playerName) {
  this.client = client;
  this.playerName = playerName;
}

Player.prototype.initCar = function(physicsEngine) {
  var playerCar = new PlayerCar(physicsEngine, this.client, this.playerName);
  this.car = playerCar.car;
}

module.exports = Player;
var PlayerCar = require('./PlayerCar');
var Car = require('./PhysicsEngine/Car');

var Player = function(client, playerName) {
  this.client = client;
  this.playerName = playerName;
}

Player.prototype.initCar = function(gameServer) {
  this.playerCar = new PlayerCar(gameServer, this.client, this.playerName, this);
  // this.car = this.playerCar.car;
}

module.exports = Player;
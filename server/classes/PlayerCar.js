var Car = require('./PhysicsEngine/Car');

var PlayerCar = function(gameServer, client, playerName, player) {
  this.player = player;
  this.client = client;
  this.gameServer = gameServer;
  this.life = 100;
  this.car = new Car(this);
  this.playerName = playerName || 'car' + Math.floor(Math.random() * 1e5);
  this.id = Math.floor(Math.random() * 1e32);
  this.score = 0;
  this.experience = 100;
  this.level = 1;
}

PlayerCar.prototype.getShared = function() {
  return this.car.getShared();
}

PlayerCar.prototype.updatePos = function() {
  return this.car.updatePos();
}

PlayerCar.prototype.receiveHit = function() {
  this.life -= 10;
}

PlayerCar.prototype.updatePlayerName = function(name) {
  this.playerName = name;
}

PlayerCar.prototype.getExperience = function() {
  this.experience += 100;
  if (this.experience >= 200) {
    this.levelUp();
  }
}

PlayerCar.prototype.levelUp = function() {
  this.level += 1;
}

module.exports = PlayerCar;
var Car = require('./PhysicsEngine/Car');

var Bot = function(gameServer) {
  this.gameServer = gameServer;
  this.car = new Car(this.gameServer.physicsEngine);
  this.gameServer.addBot(this);
}

module.exports = Bot;
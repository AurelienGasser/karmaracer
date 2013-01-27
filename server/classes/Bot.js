var PlayerCar = require('./PlayerCar');

var Bot = function(gameServer, id) {
  this.id = id;
  this.isBot = true;
  this.gameServer = gameServer;
  this.name = 'bot_' + this.id;
  this.playerCar = new PlayerCar(this.gameServer, null, this.name, this);
  return this;
}

module.exports = Bot;
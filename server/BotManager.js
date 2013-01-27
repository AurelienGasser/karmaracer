var Bot = require('./classes/Bot');

var BotManager = function(gameServer) {
  this.idCounter = 1;
  this.gameServer = gameServer;
  this.bots = {};
  setInterval(this.tick.bind(this), 20);
}

BotManager.prototype.tick = function() {
  for (var i in this.bots) {
    var bot = this.bots[i];
    if (bot.playerCar.car) {
      bot.playerCar.car.accelerate(0.1);
    }
  }
}

BotManager.prototype.addBot = function(gameServer) {
  var id = this.idCounter++;
  this.bots[id] = new Bot(this.gameServer, id);
  console.log('added a bot !')
}

module.exports = BotManager;
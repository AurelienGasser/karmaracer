var Bot = require('./classes/bot');

var BotManager = function(gameServer) {
  this.gameServer = gameServer;
  this.bots = {};
  setInterval(this.tick.bind(this), 20);
}

BotManager.prototype.tick = function() {
  for (var i in this.bots) {
    var bot = this.bots[i];
    bot.car.accelerate(5);
  }
}

BotManager.prototype.addBot = function(gameServer) {
  var botId = Math.random();
  this.bots[botId] = new Bot(this.gameServer);
  console.log('added a bot !')
}

module.exports = BotManager;
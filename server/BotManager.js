var botNames = require('./botNames');
var Bot = require('./classes/Bot');

var BotManager = function(gameServer) {
  this.gameServer = gameServer;
  this.bots = {};
  this.initBots();
  setInterval(this.tick.bind(this), 20);
}

BotManager.prototype.initBots = function() {
  var mapSize = this.gameServer.map.size.w * this.gameServer.map.size.h;
  var botDensity = 1 / 2300;
  var numBots = Math.ceil(mapSize * botDensity);
  var interval = 0;
  for (var i = 0; i < numBots; ++i) {
    setTimeout(function() {
      this.addBot();
    }.bind(this), interval);
    interval += 3000;
  }
}

BotManager.prototype.tick = function() {
  for (var i in this.bots) {
    var bot = this.bots[i];
    bot.tick();
  }
}

BotManager.prototype.getBotName = function() {
  var botName;
  var usedBotNames = Object.keys(this.bots);
  while (!botName || usedBotNames.indexOf(botName) != -1) {
    var index = Math.floor(Math.random() * botNames.length);
    botName = botNames[index];
  }
  return botName;
}

BotManager.prototype.addBot = function() {
  var id = this.getBotName();
  this.bots[id] = new Bot(this.gameServer, id);
}

BotManager.prototype.removeBot = function(gameServer) {
  // remove the first bot added
  for (var id in this.bots) {
    delete this.bots[id];
    return;
  }
}

module.exports = BotManager;
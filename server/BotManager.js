var Bot = require('./classes/Bot');

var BotManager = function(gameServer) {
  this.gameServer = gameServer;
  this.bots = {};
  setInterval(this.tick.bind(this), 20);
}

BotManager.prototype.tick = function() {
  for (var i in this.bots) {
    var bot = this.bots[i];
    bot.tick();
  }
}

BotManager.prototype.addBot = function(gameServer) {
  var id = Math.random();
  this.bots[id] = new Bot(this.gameServer, id);
  console.log('added a bot !')
}

BotManager.prototype.removeBot = function(gameServer) {
  // remove the first bot added
  for (var id in this.bots) {
    delete this.bots[id];
    return;
  }
}

module.exports = BotManager;
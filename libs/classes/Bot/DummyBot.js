var KLib = require('../KLib');
var Bot = require('./Bot');

var DummyBot = function(gameServer, name) {
  KLib.extend(Bot, this, gameServer, name);
}

DummyBot.prototype.tick = function() {
  // do nothing
}

module.exports = DummyBot;
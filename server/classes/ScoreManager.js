var _ = require('underscore');

var ScoreManager = function(gameServer) {
  this.gameServer = gameServer;

  return this;
}

ScoreManager.prototype.broadcastScores = function() {
  var scores = this.getScores();
  this.gameServer.broadcast('scores', scores);
}

function getScores(source) {
  var scores = [];
  for (id in source){
    var playerCar = source[id].playerCar;
    var score = {
      'name' : playerCar.playerName,
      'score' : playerCar.score,
      'level': playerCar.level
    };
    scores.push(score);
  }
  
  return scores;
}

ScoreManager.prototype.getScores = function() {
  var scores = [];
  scores = scores.concat(getScores(this.gameServer.players));
  scores = scores.concat(getScores(this.gameServer.botManager.bots));
  scores = _.sortBy(scores, function (s) {return s.score}).reverse();
  return scores;
}

module.exports = ScoreManager;
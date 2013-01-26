var ScoreManager = function(gameServer) {
  this.gameServer = gameServer;

  return this;
}

ScoreManager.prototype.broadcastScores = function() {
  var scores = this.getScores();
  this.gameServer.broadcast('scores', scores);
}

ScoreManager.prototype.getScores = function() {
  var scores = [];
  for (id in this.gameServer.players){
    var playerCar = this.gameServer.players[id].playerCar;
    var score = {
      'name' : playerCar.playerName,
      'score' : playerCar.score,
      'level': playerCar.level
    };
    scores.push(score);
  }
  return scores;
}

module.exports = ScoreManager;
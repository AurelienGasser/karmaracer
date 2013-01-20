var ScoreManager = function() {

    this.players = {};

    var that = this;

    function register(playerCar) {
      that.players[playerCar.id] = playerCar;
    }

    function unregister(playerCar) {
      delete that.players[playerCar.id];
    }

    function getScores(){
      var scores = [];
      for (id in that.players){

        var playerCar = that.players[id];
        var score = {
          'name' : playerCar.playerName,
          'score' : playerCar.score
        };
        scores.push(score);
      }
      return scores;
    }

    function broadcastScores(gameServer){
      var scores = getScores();
      gameServer.broadcast('scores', scores);
    }

    return {
      'register': register,
      'unregister': unregister,
      'broadcastScores' : broadcastScores
    };


  }()

  module.exports = ScoreManager;
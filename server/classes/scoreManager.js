var ScoreManager = function() {

    this.players = {};

    var that = this;

    function register(car) {
      that.players[car.id] = car;
    }

    function unregister(car) {
      delete that.players[car.id];
    }

    function getScores(){
      var scores = [];
      for (id in that.players){

        var car = that.players[id];
        var score = {
          'name' : car.playerName,
          'score' : car.score
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
(function() {
  "use strict";

  var ScoreTable = function() {
    var that = {};

    var getScores = function(gameInfo) {
      var scores = _.map(gameInfo, function(car) {
        return {
          'score': car.score,
          'level': car.level,
          'name': car.playerName,
          'highScore': car.highScore,
          'id': car.id
        };
      });
      scores = _.sortBy(scores, function(c) {
        return c.score;
      }).reverse();
      return scores;
    };

    var updateScoresHTML = function(gameInfo, items, mycar) {

      var scores = getScores(gameInfo);
      var o = [];
      for (var i = 0; i < scores.length; i++) {
        var playerScore = scores[i];                
        var userCarClass = (mycar !== null && mycar.id === playerScore.id) ? 'userCar' : '';
        o.push('<tr class="', userCarClass, '"><td>', playerScore.name, '</td><td>', playerScore.score, '</td><td>', playerScore.level, '</td><td>', playerScore.highScore, '</td></tr>');
      }
      that.scoresTable.html(o.join(''));
    };

    function setup() {
      var o = [];
      o.push('<table class="scores default" id="score-table">');
      o.push('<thead><tr>');

      o.push('<td>', $.i18n.prop('scoretable_name'), '</td>');
      o.push('<td>', $.i18n.prop('scoretable_score'), '</td>');
      o.push('<td>', $.i18n.prop('scoretable_level'), '</td>');
      o.push('<td class="large_col">', $.i18n.prop('scoretable_highscore'), '</td>');

      o.push('</tr></thead>');
      o.push('<tbody id="scores"/>');
      o.push('</table>');
      $('body').append(o.join(''));
      that.scoresTable = $('tbody#scores');
    }    
    return {
      setup : setup,
      updateScoresHTML: updateScoresHTML
    };
  }();

  Karma.ScoreTable = ScoreTable;


}());
var KLib = require('./KLib');
var CONFIG = require('./../../config');

module.exports = function(PlayerCar) {

  PlayerCar.prototype.FBInit = function(callback) {
    if (!KLib.isUndefined(this.client.handshake.session) && !KLib.isUndefined(this.client.handshake.session.fbsid)) {
      this.fbId = this.client.handshake.session.fbsid;
      return this.FBGetHighScore(callback);
    }
  };


  PlayerCar.prototype.FBSetHighScore = function() {
    var that = this;
    try {
      this.client.graph.post("/me/scores", {
        score: that.userDb.highScore,
      }, function(response) {
        if (!response || response.error) {
          console.error('FBSetHighScore', response);
        } else {
          // ok upated
        }
      });
    } catch (err) {
      console.error('FBSetHighScore', err);
    }

  };

  PlayerCar.prototype.FBGetHighScore = function(callback) {
    try {
      var that = this;
      this.client.graph.get("/" + that.fbId + "/scores/" + CONFIG.appName, function(err, response) {
        if (!response || response.error) {
          console.error('FBGetHighScore', response);
        } else {
          var score = 0;
          if (response.data.length > 0) {
            score = response.data[0].score;
          }
          if (score !== 0) {
            that.highScore = score;
            if (KLib.isFunction(callback)) {
              return callback(null);
            }
          }
        }
      });
    } catch (err) {
      console.error(err);
    }
  };
}
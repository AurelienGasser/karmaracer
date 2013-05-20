(function() {
  "use strict";


  var ExplosionsManager = function(gameInstance) {
    this.gameInstance = gameInstance;
  };

  ExplosionsManager.prototype.start = function() {
    setInterval(this.tick.bind(this), 60);
  };


  ExplosionsManager.prototype.reduceExplosionsAlpha = function() {
    var that = this;
    for (var explosionId in that.gameInstance.items.explosions) {
      that.gameInstance.items.explosions[explosionId].alpha -= 0.05;
      if (that.gameInstance.items.explosions[explosionId].alpha < 0) {
        delete that.gameInstance.items.explosions[explosionId];
      }
    }
  };


  ExplosionsManager.prototype.addExplosion = function(explosion) {
    var explosionId = Math.random();
    this.gameInstance.drawEngine.gScale(explosion);
    this.gameInstance.items.explosions[explosionId] = {
      x: explosion.x,
      y: explosion.y,
      r: 3.14 / 6 * Math.random() - 3.14,
      alpha: 0.4 * Math.random() - 0.2 + 0.25
    };
  };


  ExplosionsManager.prototype.tick = function() {
    this.reduceExplosionsAlpha();
  };


  Karma.ExplosionsManager = ExplosionsManager;



}());
(function(Engine2DCanvas) {
  "use strict";

  Engine2DCanvas.prototype.initExplosions = function() {
    setInterval(this.tickExplosions.bind(this), 60);
  };

  Engine2DCanvas.prototype.reduceExplosionsAlpha = function() {
    var that = this;
    for (var explosionId in that.gameInstance.items.explosions) {
      that.gameInstance.items.explosions[explosionId].alpha -= 0.05;
      if (that.gameInstance.items.explosions[explosionId].alpha < 0) {
        delete that.gameInstance.items.explosions[explosionId];
      }
    }
  };

  Engine2DCanvas.prototype.addExplosion = function(explosion) {
    var explosionId = Math.random();
    this.gScale(explosion);
    this.gameInstance.items.explosions[explosionId] = {
      x: explosion.x,
      y: explosion.y,
      r: 3.14 / 6 * Math.random() - 3.14,
      alpha: 0.4 * Math.random() - 0.2 + 0.25
    };
  };

  Engine2DCanvas.prototype.tickExplosions = function() {
    this.reduceExplosionsAlpha();
  };

}(Karma.Engine2DCanvas));
(function() {
  "use strict";

  var ID = 0;
  var maxTimer = 100;

  var PointsManager = function(gameInstance) {
    this.gameInstance = gameInstance;
    this.points = [];
  };

  PointsManager.prototype.add = function(info) {
    var pos = {
      x: info.x,
      y: info.y
    };
    this.points[ID] = {
      pos: pos,
      points: 50,
      timer: 0,
      id : ID
    };
    ID += 1;
  };

  PointsManager.prototype.draw = function(ctx, gScale) {
    ctx.font = '16px Trebuchet MS';
    var keys = Object.keys(this.points);
    if (this.points.length === 0){
      return;
    }
    for (var i = 0; i < keys.length; i++) {
      var p = this.points[keys[i]];
      if (p) {
        var text = '+ ' + p.points + ' Karma';
        var textSize = ctx.measureText(text);
        ctx.save();
        ctx.translate(p.pos.x * gScale, p.pos.y * gScale);
        ctx.fillStyle = 'rgba(255, 255, 255, ' + ((maxTimer - p.timer) / 100)+ ')';
        ctx.fillText(text, -textSize.width / 2, 0);
        ctx.restore();
        p.timer += 1;
        if (p.timer > maxTimer) {
          delete this.points[p.id];
        }
      }
    }
  };

  Karma.PointsManager = PointsManager;

}());
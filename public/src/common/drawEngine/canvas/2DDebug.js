(function(Engine2DCanvas) {
  "use strict";

  Engine2DCanvas.prototype.drawLocalPhysicsEngineBodies = function(ctx) {
    var that = this;
    // draw static bodies
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#00FF00";
    // draw other bodies
    if (that.gameInstance.engine.bodies !== null) {
      for (var id in that.gameInstance.engine.bodies) {
        var c = that.gameInstance.engine.bodies[id];
        if (id === this.gameInstance.engine.myCarBodyId + "") {
          ctx.strokeStyle = "#FF0000";
        } else {
          ctx.strokeStyle = "#00FF00";
        }
        c = {
          x: c.x * that.gScaleValue,
          y: c.y * that.gScaleValue,
          w: c.w * that.gScaleValue,
          h: c.h * that.gScaleValue,
          r: c.r
        };
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.r);
        ctx.strokeRect(-c.w / 2, -c.h / 2, c.w, c.h);
        ctx.restore();
      }
    }
  };

}(Karma.Engine2DCanvas));
(function(Engine2DCanvas) {
  "use strict";

  Engine2DCanvas.prototype.drawLocalPhysicsEngineBodies = function(ctx) {
    // draw static bodies
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#00FF00";
    // draw other bodies
    if (this.gameInstance.engine.bodies !== null) {
      for (var id in this.gameInstance.engine.bodies) {
        var c = this.gameInstance.engine.bodies[id];
        if (id === this.gameInstance.engine.myCarBodyId + "") {
          ctx.strokeStyle = "#FF0000";
        } else {
          ctx.strokeStyle = "#00FF00";
        }
        c = {
          x: c.x * this.gScaleValue,
          y: c.y * this.gScaleValue,
          w: c.w * this.gScaleValue,
          h: c.h * this.gScaleValue,
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

  Engine2DCanvas.prototype.drawMostUpToDateMyCar = function(ctx) {
    if (typeof this.gameInstance.mostUpToDateMyCarPos !== 'undefined') {
      var c = this.gameInstance.mostUpToDateMyCarPos;
      c = {
        x: c.x * this.gScaleValue,
        y: c.y * this.gScaleValue,
        w: 1 * this.gScaleValue,
        h: 0.5 * this.gScaleValue,
        r: c.r
      };
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#FFFF00";
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.r);
      ctx.strokeRect(-c.w / 2, -c.h / 2, c.w, c.h);
      ctx.restore();
    }
  };

}(Karma.Engine2DCanvas));
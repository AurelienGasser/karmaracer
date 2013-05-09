(function(Engine2DCanvas) {
  "use strict";

  var scale2 = 32 * 6;

  function drawPoint(ctx, p, color) {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = color || '#FF0000';
    ctx.arc(p.x, p.y, 10, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = color || '#00FF00';
    if (p.name) {
      ctx.fillText(p.name, p.x, p.y);
    }
    ctx.restore();
  }


  function drawAxis(ctx, a) {
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(-a.x * scale2, -a.y * scale2);
    // ctx.lineTo(coord.x, coord.y);
    ctx.lineTo(a.x * scale2, a.y * scale2);
    ctx.closePath();
    ctx.stroke();
  }

  // 'drawLine' is defined but never used.
  // function drawLine(ctx, p1, p2, r) {
  //   drawPoint(ctx, p2);
  //   ctx.save();
  //   ctx.strokeStyle = '#0000FF';
  //   ctx.fillStyle = '#0000FF';
  //   ctx.translate(p2.x, p2.y);
  //   ctx.rotate(r);
  //   var w = 5;
  //   ctx.fillRect(-w / 2, -w / 2, w, w);
  //   ctx.restore();
  //   ctx.beginPath();
  //   ctx.moveTo(p1.x, p1.y);
  //   // ctx.moveTo(0, 0);
  //   ctx.lineTo(p2.x, p2.y);
  //   ctx.closePath();
  //   ctx.stroke();
  // }

  Engine2DCanvas.prototype.drawBodies = function(ctx) {
    var c, i;

    if (this.debugDraw && this.bodies !== null) {
      for (i = 0; i < this.bodies.length; i++) {
        c = this.bodies[i];

        ctx.save();
        ctx.fillStyle = c.color;
        ctx.translate(c.x, c.y);
        ctx.beginPath();
        ctx.moveTo(c.ul.x, c.ul.y);
        ctx.lineTo(c.ur.x, c.ur.y);
        ctx.lineTo(c.br.x, c.br.y);
        ctx.lineTo(c.bl.x, c.bl.y);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.save();
        var textSize = ctx.measureText(c.playerName);
        var textPad = 25;
        ctx.translate(c.x, c.y);
        ctx.fillText(c.playerName, -textSize.width / 2, -textPad);
        ctx.restore();
      }



      for (i = 0; i < this.bodies.length; i++) {
        c = this.bodies[i];
        // var scale = 32;


        ctx.save();
        ctx.translate(c.x, c.y);

        // drawPoint(ctx, c.ur)
        // drawPoint(ctx, c.ul)
        // drawPoint(ctx, c.br)
        // drawPoint(ctx, c.bl)
        var debug_collisions = false;
        if (debug_collisions) {
          if (!_.isUndefined(c.collision)) {
            drawAxis(ctx, c.collision.a1);
            drawAxis(ctx, c.collision.a2);
            drawAxis(ctx, c.collision.a3);
            drawAxis(ctx, c.collision.a4);
            for (i = 1; i <= 4; ++i) {
              drawPoint(ctx, c.collision.axesMinMax[i].minA, '#000');
              drawPoint(ctx, c.collision.axesMinMax[i].maxA, '#F00');
              drawPoint(ctx, c.collision.axesMinMax[i].minB, '#0F0');
              drawPoint(ctx, c.collision.axesMinMax[i].maxB, '#00F');
            }
          }
        }
        ctx.restore();
      }
    }
  };

  Engine2DCanvas.prototype.drawCollisionPoints = function() {
    if (!this.items.collisionPoints) {
      return;
    }
    var ctx = this.ctx;
    for (var i in this.items.collisionPoints) {
      var a = this.items.collisionPoints[i];
      drawPoint(ctx, a, '#F00');
    }
  };
}(Karma.Engine2DCanvas));
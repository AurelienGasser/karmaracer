
(function(Engine2DCanvas) {
  "use strict";

  Engine2DCanvas.prototype.drawCars = function(ctx) {
    if (this.items.cars !== null) {
      for (var i = 0; i < this.items.cars.length; i++) {
        var c = this.items.cars[i];
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.r);
        var carImage = this.gameCarsImages[c.carImageName];
        ctx.drawImage(this.carImages[carImage.name], 0, 0, carImage.w, carImage.h, -c.w / 2, -c.h / 2, c.w, c.h);

        if (c.shootingWithWeapon) {
          this.drawGunFlame(ctx, c);
        }

        // if(this.debugDraw) {
        //   ctx.fillStyle = '#FFFFFF';
        //   ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
        // }
        ctx.restore();


        var textSize = ctx.measureText(c.playerName);
        var textPad = 25;
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.font = '10px Trebuchet MS';
        ctx.fillStyle = 'white';
        ctx.fillText(c.playerName, -textSize.width / 2, -textPad);
        this.drawLifeBar(ctx, c);
        ctx.restore();

        this.drawBullet(c, ctx);
      }
    }
  };
}(Karma.Engine2DCanvas));
(function(Engine2DCanvas) {
  "use strict";

  Engine2DCanvas.prototype.loadCars = function() {
    var that = this;
    var getCar = function(name, imageName, w, h) {
      var car = {
        name: name,
        path: '/sprites/' + imageName,
        w: w,
        h: h
      };
      car.image = new Image();
      car.image.src = car.path;
      return car;
    };
    var registerCar = function(car) {
      that.carsImages[car.name] = car;
    };

    this.carsImages = {};
    registerCar(getCar('c1', 'car.png', 128, 64));
    registerCar(getCar('c2', 'car2.png', 82, 36));
    registerCar(getCar('c3', 'car3.png', 72, 32));
    registerCar(getCar('c4', 'car4.png', 74, 34));
    registerCar(getCar('c5', 'car5.png', 81, 35));
  };


  Engine2DCanvas.prototype.drawCars = function(ctx) {
    if (this.items.cars !== null) {
      for (var i = 0; i < this.items.cars.length; i++) {
        var c = this.items.cars[i];
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.r);
        var carImage = this.carsImages[c.carImageName];
        ctx.drawImage(carImage.image, 0, 0, carImage.w, carImage.h, -c.w / 2, -c.h / 2, c.w, c.h);

        if (c.shootingWithWeapon !== null) {
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
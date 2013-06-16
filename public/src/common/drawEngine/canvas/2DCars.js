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

  Engine2DCanvas.prototype.drawLifeBar = function(ctx, c, w) {
    ctx.save();
    ctx.translate(-w / 2, -40);
    var maxLifeSize = w;
    ctx.fillStyle = '#0F0';
    ctx.fillRect(0, 0, maxLifeSize, 5);
    ctx.fillStyle = '#F00';
    var ratioSize = maxLifeSize * (c.life / c.maxLife);
    ctx.fillRect(ratioSize, 0, maxLifeSize - ratioSize, 5);
    ctx.restore();
  };


  var maxFlameTick = 12;

  Engine2DCanvas.prototype.drawSingleGunFlame = function(ctx, car, angle, distance, size) {
    var ratio = 1.5;
    ctx.rotate(angle);
    var w = size.w / 2;
    var h = size.h / 2;
    if (car.flame > maxFlameTick / 2) {
      ctx.drawImage(this.gunFlameImage, 0, 0, 135, 125, distance, -h / 2, w, h);
    } else {
      ctx.drawImage(this.gunFlameImage, 0, 0, 135, 125, distance, -h / 2 / ratio, w / ratio, h / ratio);
    }
    ctx.rotate(-angle);
  };



  Engine2DCanvas.prototype.drawGunFlame = function(ctx, car, size) {
    if (KLib.isUndefined(this.carFlameTicks[car.id])) {
      this.carFlameTicks[car.id] = 0;
    }
    car.flame = this.carFlameTicks[car.id];

    var w = size.w;

    switch (car.shootingWithWeapon) {
      case '90AngleMachineGun':
        this.drawSingleGunFlame(ctx, car, 0, w / 2, size);
        this.drawSingleGunFlame(ctx, car, Math.PI / 2, w / 4, size);
        this.drawSingleGunFlame(ctx, car, -Math.PI / 2, w / 4, size);
        break;
      case 'SuperMachineGun':
        this.drawSingleGunFlame(ctx, car, 0, w / 2, size);
        this.drawSingleGunFlame(ctx, car, Math.PI / 4, w / 4, size);
        this.drawSingleGunFlame(ctx, car, -Math.PI / 4, w / 4, size);
        break;
      case 'MachineGun':
        this.drawSingleGunFlame(ctx, car, 0, w / 2, size);
        break;
      default:
        this.drawSingleGunFlame(ctx, car, 0, w / 2, size);
        break;
    }
    this.carFlameTicks[car.id] = (this.carFlameTicks[car.id] + 1) % maxFlameTick;
  };


  Engine2DCanvas.prototype.drawCarForMiniMap = function(ctx, c, pos) {
    ctx.strokeStyle = 'white';
    if (this.items.mycar !== null && c.id === this.items.mycar.id) { //me
      ctx.fillStyle = 'black';      
    } else if (c.isBot === true) { //bots
      ctx.fillStyle = 'white';
    } else { //player
      ctx.fillStyle = 'red';
      ctx.strokeStyle = 'red';
    }
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 2, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  };



  Engine2DCanvas.prototype.drawCars = function(ctx) {
    if (this.items.cars !== null) {
      for (var i = 0; i < this.items.cars.length; i++) {
        var c = this.items.cars[i];
        if (c.dead) {
          continue;
        }
        var pos = {
          x: this.gScaleValue * c.x,
          y: this.gScaleValue * c.y
        };
        var size = {
          w: this.gScaleValue * c.w,
          h: this.gScaleValue * c.h
        };
        if (this.isMiniMap === true) {
          this.drawCarForMiniMap(ctx, c, pos);
        } else {
          ctx.save();
          ctx.translate(pos.x, pos.y);
          ctx.rotate(c.r);

          // car
          var carImage = this.carsImages[c.carImageName];
          ctx.drawImage(carImage.image, 0, 0, carImage.w, carImage.h, -size.w / 2, -size.h / 2, size.w, size.h);

          // gun flammes
          if (c.shootingWithWeapon !== null) {
            this.drawGunFlame(ctx, c, size);
          }
          ctx.restore();

          //name
          var textSize = ctx.measureText(c.playerName);
          var textPad = 25;
          ctx.save();
          ctx.translate(pos.x, pos.y);
          ctx.fillStyle = 'white';
          ctx.fillText(c.playerName, -textSize.width / 2, -textPad);
          this.drawLifeBar(ctx, c, size.w);
          ctx.restore();

          // bullet
          this.drawBullet(c, ctx, pos);
        }
      }
    }
  };
}(Karma.Engine2DCanvas));
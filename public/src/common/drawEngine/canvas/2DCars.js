(function(Engine2DCanvas) {
  "use strict";

  Engine2DCanvas.prototype.loadCars = function() {
    var that = this;

    var getCarFromDB = function(carDB) {
      carDB.image = new Image();
      carDB.image.src = carDB.path;
      return carDB;
    };

    var registerCar = function(car) {
      that.cars[car.name] = car;
    };

    this.cars = {};

    if (!KLib.isUndefined(this.connection)) {
      this.connection.emit('getCars', function(err, cars) {
        if (err) {
          Karma.Log.error(err);
          return;
        }
        for (var i = 0; i < cars.length; i++) {
          registerCar(getCarFromDB(cars[i]));
        }
      });
    }
  };

  Engine2DCanvas.prototype.drawLifeBar = function(ctx, c, player, w) {
    ctx.save();
    ctx.translate(-w / 2, -40);
    var maxLifeSize = w;
    ctx.fillStyle = '#0F0';
    ctx.fillRect(0, 0, maxLifeSize, 5);
    ctx.fillStyle = '#F00';
    var ratioSize = maxLifeSize * (c.life / player.maxLife);
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


  Engine2DCanvas.prototype.drawCarForMiniMap = function(ctx, c, player, pos) {
    ctx.strokeStyle = 'white';
    if (this.items.mycar !== null && c.id === this.items.mycar.id) { //me
      ctx.fillStyle = 'black';
    } else if (player.isBot === true) { //bots
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
    if (this.gameInstance === null) {
      return;
    }
    ctx.font = '10px Trebuchet MS';
    if (this.items.cars !== null) {
      for (var i = 0; i < this.items.cars.length; i++) {
        var c = this.items.cars[i];
        if (c.dead) {
          continue;
        }
        // car
        var player = this.gameInstance.gameInfo[c.id];
        var car = this.cars[player.carImageName];
        c.playerName = player.playerName;
        c.w = car.w;
        c.h = car.h;

        var pos = {
          x: this.gScaleValue * c.x,
          y: this.gScaleValue * c.y
        };
        var size = {
          w: this.gScaleValue * c.w,
          h: this.gScaleValue * c.h
        };
        if (this.isMiniMap === true) {
          this.drawCarForMiniMap(ctx, c, player, pos);
        } else {
          ctx.save();
          ctx.translate(pos.x, pos.y);
          ctx.rotate(c.r);

          ctx.drawImage(car.image, 0, 0, car.imageSize.w, car.imageSize.h, -size.w / 2, -size.h / 2, size.w, size.h);

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
          this.drawLifeBar(ctx, c, player, size.w);
          ctx.restore();

          // bullet
          this.drawBullet(c, ctx, pos);
        }
      }
    }
  };
}(Karma.Engine2DCanvas));
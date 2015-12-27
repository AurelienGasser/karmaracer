(function(EngineWebGL) {
  "use strict";
  
  EngineWebGL.prototype.drawMyCar = function() {
    var carHeight = 0.6;
    var myCar = this.gameInstance.myCar;
    
    if (!myCar) {
      return;
    }

    this.drawBox([myCar.x, myCar.y, carHeight / 2, myCar.r], [1, 1, carHeight], [0, 0, 1]);    
  };

  EngineWebGL.prototype.drawCars = function() {
    var interpData = this.interpolator.interpData;
    if (!interpData.ready) {
      return;
    }
    var cars = interpData.snapAfter.cars;
    if (!cars) {
      return;
    }
    for (var j in cars) {
      var carPos = this.interpPosOfCar(j);
      var carId = cars[j].id;
      var player = this.gameInstance.gameInfo[carId];
      if (player) {
        var carImage = this.gameInstance.cars[player.carImageName];
        carPos.id = carId;        
        carPos.w = carImage.w;
        carPos.h = carImage.h;
        this.gameInstance.engine.replaceCarBody(carPos);
        if (!cars[j].dead) {
          this._drawCar(cars[j], carPos, carImage);          
        }
      }
    }
  };

  EngineWebGL.prototype.interpPosOfCar = function(carIndex) {
    var interpData = this.interpolator.interpData;
    var carBefore = interpData.snapBefore.cars[carIndex];
    var carAfter = interpData.snapAfter.cars[carIndex];
    return this.interpolator.interpPos(carBefore, carAfter, interpData.interpPercent);
  };

  EngineWebGL.prototype._drawCar = function(c, pos, car) {
    var carHeight = 0.6;
    
    this.drawBox([c.x, c.y, carHeight / 2, c.r], [car.w, car.h, carHeight], [1, 0, 1]);

    // // gun flammes
    // if (c.shootingWithWeapon !== null) {
    //   this.drawGunFlame(ctx, c, size);
    // }
    // //name
    // var textSize = ctx.measureText(c.playerName);
    // var textPad = 25;
    // ctx.save();
    // ctx.translate(pos.x, pos.y);
    // ctx.fillStyle = 'white';
    // ctx.fillText(c.playerName, -textSize.width / 2, -textPad);
    // this.drawLifeBar(ctx, c, player, size.w);
    // ctx.restore();
    //
    // // bullet
    // this.drawBullet(c, ctx, pos);
  };

  EngineWebGL.prototype.drawLifeBar = function(ctx, c, player, w) {
    // ctx.save();
    // ctx.translate(-w / 2, -40);
    // var maxLifeSize = w;
    // ctx.fillStyle = '#0F0';
    // ctx.fillRect(0, 0, maxLifeSize, 5);
    // ctx.fillStyle = '#F00';
    // var ratioSize = maxLifeSize * (c.life / player.maxLife);
    // ctx.fillRect(ratioSize, 0, maxLifeSize - ratioSize, 5);
    // ctx.restore();
  };


  var maxFlameTick = 12;

  EngineWebGL.prototype.drawSingleGunFlame = function(ctx, car, angle, distance, size) {
    // var ratio = 1.5;
    // ctx.rotate(angle);
    // var w = size.w / 2;
    // var h = size.h / 2;
    // if (car.flame > maxFlameTick / 2) {
    //   ctx.drawImage(this.gunFlameImage, 0, 0, 135, 125, distance, -h / 2, w, h);
    // } else {
    //   ctx.drawImage(this.gunFlameImage, 0, 0, 135, 125, distance, -h / 2 / ratio, w / ratio, h / ratio);
    // }
    // ctx.rotate(-angle);
  };

  EngineWebGL.prototype.drawGunFlame = function(ctx, car, size) {
    // if (KLib.isUndefined(this.carFlameTicks[car.id])) {
    //   this.carFlameTicks[car.id] = 0;
    // }
    // car.flame = this.carFlameTicks[car.id];
    //
    // var w = size.w;
    //
    // switch (car.shootingWithWeapon) {
    //   case '90AngleMachineGun':
    //     this.drawSingleGunFlame(ctx, car, 0, w / 2, size);
    //     this.drawSingleGunFlame(ctx, car, Math.PI / 2, w / 4, size);
    //     this.drawSingleGunFlame(ctx, car, -Math.PI / 2, w / 4, size);
    //     break;
    //   case 'SuperMachineGun':
    //     this.drawSingleGunFlame(ctx, car, 0, w / 2, size);
    //     this.drawSingleGunFlame(ctx, car, Math.PI / 4, w / 4, size);
    //     this.drawSingleGunFlame(ctx, car, -Math.PI / 4, w / 4, size);
    //     break;
    //   case 'MachineGun':
    //     this.drawSingleGunFlame(ctx, car, 0, w / 2, size);
    //     break;
    //   default:
    //     this.drawSingleGunFlame(ctx, car, 0, w / 2, size);
    //     break;
    // }
    // this.carFlameTicks[car.id] = (this.carFlameTicks[car.id] + 1) % maxFlameTick;
  };

}(Karma.EngineWebGL));
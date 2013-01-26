var Bullet = require('../PhysicsEngine/Bullet');

var SuperMachineGun = function() {
  this.name = 'super machine gun';
  this.bullets = [];
}

SuperMachineGun.prototype.step = function() {
  var deads = [];
  for (var id in this.bullets) {
    if (this.bullets.hasOwnProperty(id)) {
      var bullet = this.bullets[id];
      if (bullet.body === null) {
        deads.push(id);
      } else {
        bullet.accelerate(500);
        --bullet.life;
        if (bullet.life <= 0) {
          bullet.scheduleForDestroy();
          deads.push(id);
        }
      }
    }
  }
  for (var i = 0; i < deads.length; i++) {
    var id = deads[i];
    delete this.bullets[id];
  };
}

SuperMachineGun.prototype.shoot = function(playerCar) {
  var distanceFromCar = playerCar.car.size.w / 2;
  var PI = 3.14;
  var angle1 =  -PI / 4;
  var angle2 =   PI / 4;
  var pos1 = playerCar.car.getVector({
    x: distanceFromCar * playerCar.car.size.w,
    y: distanceFromCar * playerCar.car.size.w
  }, angle1);
  var pos2 = playerCar.car.getVector({
    x: distanceFromCar * playerCar.car.size.w,
    y: distanceFromCar * playerCar.car.size.w
  }, angle2);
  var pos3 = playerCar.car.getVector({
    x: distanceFromCar * playerCar.car.size.w,
    y: distanceFromCar * playerCar.car.size.w
  });
  var b1 = new Bullet(playerCar, pos1, playerCar.car.getAngle() + angle1);
  var b2 = new Bullet(playerCar, pos2, playerCar.car.getAngle() + angle2);
  var b3 = new Bullet(playerCar, pos3, playerCar.car.getAngle());
  b1.accelerate(1);
  b2.accelerate(1);
  b3.accelerate(1);
  this.bullets[b1.id] = b1;
  this.bullets[b2.id] = b2;
  this.bullets[b3.id] = b3;
}

SuperMachineGun.prototype.getGraphicBullets = function() {
  var bullets = [];
  for (var id in this.bullets) {
    if(this.bullets.hasOwnProperty(id)) {
      var bullet = this.bullets[id];
      bullets.push(bullet.getShared());
    }
  }
  return bullets;
}

module.exports = SuperMachineGun;
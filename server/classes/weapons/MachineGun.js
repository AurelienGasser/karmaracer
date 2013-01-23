var Bullet = require('../PhysicsEngine/Bullet');

var MachineGun = function() {
  this.name = 'machine gun';
  this.bullets = [];
}

MachineGun.prototype.step = function() {
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

MachineGun.prototype.shoot = function(playerCar) {
  var distanceFromCar = 1.2;
  var pos = playerCar.car.getVector({
    x: distanceFromCar * playerCar.car.size.w,
    y: distanceFromCar * playerCar.car.size.w
  });
  var b = new Bullet(playerCar, pos, playerCar.car.getAngle());
  b.accelerate(1);
  this.bullets[b.id] = b;
}

MachineGun.prototype.getGraphicBullets = function() {
  var bullets = [];
  for (var id in this.bullets) {
    if(this.bullets.hasOwnProperty(id)) {
      var bullet = this.bullets[id];
      bullets.push(bullet.getShared());
    }
  }
  return bullets;
}

module.exports = MachineGun;
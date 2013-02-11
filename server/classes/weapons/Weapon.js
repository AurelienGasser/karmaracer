var Bullet = require('../PhysicsEngine/Bullet');
var _ = require('underscore');

var Weapon = function() {
    this.projectiles = {};
    this.accelerate = 500;
    this.lastShot = new Date();
    this.lastShotInterval = 0;
    this.startAcceleration = 1;
    this.ProjectileClass = Bullet;
  }


Weapon.prototype.deleteDeads = function(deads) {
  for(var i = 0; i < deads.length; i++) {
    var id = deads[i];
    delete this.projectiles[id];
  };
};

Weapon.prototype.getProjectileVector = function(playerCar, angle) {
  var car = playerCar.car;
  var distanceFromCar = car.size.w;
  var pos = car.getVector({
    x: distanceFromCar,
    // * car.size.w,
    y: distanceFromCar // * car.size.h
  }, angle);
  return pos;
};

Weapon.prototype.canShoot = function() {
  var now = (new Date()).getTime();
  if(now - this.lastShot > this.lastShotInterval) {
    this.lastShot = now;
    return true;
  } else {
    return false;
  }
};

Weapon.prototype.shoot = function(playerCar) {
  if(!_.isUndefined(playerCar) && this.canShoot()) {
    this.customShoot(playerCar);
  }
};
Weapon.prototype.customShoot = function(playerCar) {
  this.addProjectile(playerCar);
};

Weapon.prototype.addProjectile = function(playerCar, angle) {
  if(_.isUndefined(angle)) {
    angle = 0;
  }
  var pos = this.getProjectileVector(playerCar, angle);
  var b = new this.ProjectileClass(playerCar, pos, playerCar.car.getAngle() + angle);
  b.accelerate(this.startAcceleration);
  this.projectiles[b.id] = b;
};

Weapon.prototype.step = function() {
  var deads = [];
  for(var id in this.projectiles) {
    if(this.projectiles.hasOwnProperty(id)) {
      var projectile = this.projectiles[id];
      if(projectile.body === null) {
        deads.push(id);
      } else {
        projectile.accelerate(this.accelerate);
        projectile.life -= 1;
        if(projectile.life <= 0) {
          projectile.scheduleForDestroy();
          deads.push(id);
        }
      }
    }
  }
  this.deleteDeads(deads);
};

Weapon.prototype.getGraphics = function() {
  var graphics = [];
  for(var id in this.projectiles) {
    if(this.projectiles.hasOwnProperty(id)) {
      var projectile = this.projectiles[id];
      graphics.push(projectile.getShared());
    }
  }
  return graphics;

}


module.exports = Weapon;
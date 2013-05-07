var Bullet = require('../PhysicsEngine/Bullet');
var KLib = require('./../KLib');

var Weapon = function(gameServer) {
    this.gameServer = gameServer;
    this.engine = this.gameServer.engine;
    this.name = 'anonymous';
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
  var distanceFromCar = car.w;
  var pos = car.getVector({
    x: distanceFromCar,
    y: distanceFromCar
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
  if(!KLib.isUndefined(playerCar) && this.canShoot()) {
    this.customShoot(playerCar);
  }
};
Weapon.prototype.customShoot = function(playerCar) {
  this.addProjectile(playerCar);
};

Weapon.prototype.addProjectile = function(playerCar, angle) {
  if(KLib.isUndefined(angle)) {
    angle = 0;
  }
  var pos = {
    x: playerCar.car.x,
    y: playerCar.car.y
  };
  var b = new this.ProjectileClass(playerCar, pos, playerCar.car.r + angle);

  var collision = this.engine.bulletCollision(b);

  var gScale = this.engine.gScale;
  if(collision !== null) {
    b.explode(collision.point);
    if(collision.body.name === 'car') {
      this.gameServer.carManager.projectileHitCar(b.playerCar, collision.body.playerCar, b)
    }
  }
};

Weapon.prototype.step = function() {
  var deads = [];
  for(var id in this.projectiles) {
    if(this.projectiles.hasOwnProperty(id)) {
      var projectile = this.projectiles[id];
      if(projectile.body === null) {
        deads.push(id);
      } else {
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
  var that = this;
  var graphics = [];
  for(var id in this.projectiles) {
    if(this.projectiles.hasOwnProperty(id)) {
      var projectile = this.projectiles[id];
      var pShared = projectile.getShared();
      pShared.name = that.name;
      graphics.push(pShared);
    }
  }
  return graphics;

}


module.exports = Weapon;
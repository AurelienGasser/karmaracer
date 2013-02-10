var Bullet = require('../PhysicsEngine/Bullet');
var Heritage = require('../Heritage');
var Weapon = require('./Weapon');

var MachineGun = function() {
  Heritage.extend(Weapon, this);
  this.name = 'machine gun';
}

MachineGun.prototype.shoot = function(playerCar) {
  var now = (new Date()).getTime();
  if (now - this.lastShot > 32) {
    this.lastShot = now;
    var distanceFromCar = playerCar.car.size.w / 2;
    var pos = playerCar.car.getVector({
      x: distanceFromCar,
      y: distanceFromCar
    });
    var b = new Bullet(playerCar, pos, playerCar.car.getAngle());
    b.accelerate(1);
    this.projectiles[b.id] = b;
  }
}

module.exports = MachineGun;
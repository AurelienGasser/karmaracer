var Rocket = require('../PhysicsEngine/Rocket');
var Heritage = require('../Heritage');
var Weapon = require('./Weapon');


var MachineGun = function() {
  Heritage.extend(Weapon, this);
  this.name = 'rocket launcher';
}

MachineGun.prototype.shoot = function(playerCar) {
  var now = (new Date()).getTime();
  if (now - this.lastShot > 1000) {
    this.lastShot = now;
    var distanceFromCar = 1.2;
    var pos = playerCar.car.getVector({
      x: distanceFromCar * playerCar.car.size.w,
      y: distanceFromCar * playerCar.car.size.w
    });
    var b = new Rocket(playerCar, pos, playerCar.car.getAngle());
    b.accelerate(0.1);
    this.projectiles[b.id] = b;
  }
}

module.exports = MachineGun;
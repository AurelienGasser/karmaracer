var Bullet = require('../PhysicsEngine/Bullet');
var Heritage = require('../Heritage');
var Weapon = require('./Weapon');


var SuperMachineGun = function() {
    Heritage.extend(Weapon, this);
    this.lastShotInterval = 32;
    this.ProjectileClass = Bullet;
    this.startAcceleration = 1;    
    this.name = 'super machine gun';
  }

SuperMachineGun.prototype.shoot = function(playerCar) {
  var angle1 = -Math.PI / 4;
  var angle2 = Math.PI / 4;
  var carAngle = playerCar.car.getAngle();
  this.addProjectile(playerCar, angle1);
  this.addProjectile(playerCar, angle2);
  this.addProjectile(playerCar);
}

module.exports = SuperMachineGun;
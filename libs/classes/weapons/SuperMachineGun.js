var Bullet = require('../PhysicsEngine/Bullet');
var KLib = require('./../KLib');
var Weapon = require('./Weapon');


var SuperMachineGun = function(gameServer) {
    KLib.extend(Weapon, this, gameServer);
    this.lastShotInterval = 32;
    this.ProjectileClass = Bullet;
    this.startAcceleration = 1;
    this.name = 'SuperMachineGun';
  }

SuperMachineGun.prototype.customShoot = function(playerCar) {

  var angle1 = -Math.PI / 4;
  var angle2 = Math.PI / 4;
  this.addProjectile(playerCar, angle1);
  this.addProjectile(playerCar, angle2);
  this.addProjectile(playerCar);

}

module.exports = SuperMachineGun;
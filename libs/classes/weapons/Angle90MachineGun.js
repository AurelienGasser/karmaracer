var Bullet = require('./../Physics/Bodies/Bullet');
var KLib = require('./../KLib');
var Weapon = require('./Weapon');


var Angle90MachineGun = function(gameServer) {
    KLib.extend(Weapon, this, gameServer);
    this.lastShotInterval = 32;
    this.ProjectileClass = Bullet;
    this.startAcceleration = 1;
    this.name = '90AngleMachineGun';
  }

Angle90MachineGun.prototype.customShoot = function(playerCar) {
    var angle1 = -Math.PI / 2;
    var angle2 = Math.PI / 2;
    this.addProjectile(playerCar, angle1);
    this.addProjectile(playerCar, angle2);
    this.addProjectile(playerCar, 0);
  
}

module.exports = Angle90MachineGun;
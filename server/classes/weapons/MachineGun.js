var Bullet = require('../PhysicsEngine/Bullet');
var Heritage = require('../Heritage');
var Weapon = require('./Weapon');

var MachineGun = function() {
    Heritage.extend(Weapon, this);
    this.name = 'machine gun';
    this.lastShotInterval = 32;
    this.ProjectileClass = Bullet;
    this.startAcceleration = 1;
  }

module.exports = MachineGun;
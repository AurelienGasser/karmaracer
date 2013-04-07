var Bullet = require('../PhysicsEngine/Bullet');
var KLib = require('./../KLib');
var Weapon = require('./Weapon');

var MachineGun = function(engine) {
    KLib.extend(Weapon, this);
    this.engine = engine;
    this.name = 'machine gun';
    this.lastShotInterval = 32;
    this.ProjectileClass = Bullet;
    this.startAcceleration = 2;
  }

module.exports = MachineGun;
var Rocket = require('../PhysicsEngine/Rocket');
var KLib = require('./../KLib');
var Weapon = require('./Weapon');


var MachineGun = function(gameServer) {
    KLib.extend(Weapon, this, gameServer);
    this.name = 'rocket launcher';
    this.accelerate = 1;
    this.lastShotInterval = 1000;
    this.ProjectileClass = Rocket;
    this.startAcceleration = 0.1;
  }

module.exports = MachineGun;
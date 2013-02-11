var Car = require('./PhysicsEngine/Car');
var RocketLauncher = require('./weapons/RocketLauncher');
var MachineGun = require('./weapons/MachineGun');
var SuperMachineGun = require('./weapons/SuperMachineGun');
var Angle90MachineGun = require('./weapons/Angle90MachineGun');

var WeaponsByClass = {
  1: MachineGun,
  2: MachineGun,
  3: SuperMachineGun,
  4: MachineGun,
  5: Angle90MachineGun,
  6: SuperMachineGun,
  7: MachineGun,
  8: SuperMachineGun,
  9: RocketLauncher,
};


var playerCarID = 0;
var PlayerCar = function(gameServer, client, playerName, player) {
    this.player = player;
    this.client = client;
    this.isBot = !this.client;
    this.gameServer = gameServer;
    this.life = 100;
    this.car = new Car(this);
    this.playerName = playerName || 'car' + Math.floor(Math.random() * 1e5);
    this.id = playerCarID++;// Math.floor(Math.random() * 1e32);
    this.score = 0;
    this.experience = 0;
    this.level = 1;
    this.updateWeapon();
    this.dead = false;
  }

PlayerCar.prototype.getShared = function() {
  return this.car.getShared();
}

PlayerCar.prototype.updatePos = function() {
  if(!this.dead) {
    return this.car.updatePos();
  }
}

PlayerCar.prototype.receiveHit = function(damage) {
  this.life -= damage;
}

PlayerCar.prototype.updatePlayerName = function(name) {
  this.playerName = name;
}

PlayerCar.prototype.getExperience = function(experience) {
  this.experience += experience;
  if(this.experience >= 100) {
    this.levelUp();
  }
  if(this.experience < 0) {
    this.levelDown();
  }
}

PlayerCar.prototype.updateWeapon = function() {
  var WeaponClass = WeaponsByClass[this.level];
  this.weapon = new WeaponClass();
}

PlayerCar.prototype.levelUp = function() {
  if(this.level >= Object.keys(WeaponsByClass).length) {
    this.gameServer.gameEnd(this);
  } else {
    this.level += 1;
    this.updateWeapon();
    this.experience = 0;
  }
}

PlayerCar.prototype.levelDown = function() {
  this.level -= 1;
  if(this.level == 0) {
    this.level = 1;
  }
  this.updateWeapon();
  this.experience = 0;
}

PlayerCar.prototype.shoot = function() {
  this.weapon.shoot(this);
}

PlayerCar.prototype.die = function() {
  this.getExperience(-50);
  this.dead = true;
  this.car.scheduleForDestroy();
  this.car = null;
  if(this.player.client) {
    this.player.client.keyboard = {};
    this.player.client.emit('dead', null);
  }
  setTimeout(function() {
    if(this.isBot || this.player.connected) {
      this.dead = false;
      this.car = new Car(this);
      this.life = 100;
    }
  }.bind(this), 5000);
}

module.exports = PlayerCar;
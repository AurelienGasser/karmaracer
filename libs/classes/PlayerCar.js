var Car = require('./PhysicsEngine/Car');
var RocketLauncher = require('./weapons/RocketLauncher');
var MachineGun = require('./weapons/MachineGun');
var SuperMachineGun = require('./weapons/SuperMachineGun');
var Angle90MachineGun = require('./weapons/Angle90MachineGun');
var KLib = require('./KLib');
var CONFIG = require('./../../config');


var WeaponsByClass = {
  1: MachineGun,
  2: MachineGun,
  3: SuperMachineGun,
  4: MachineGun,
  5: Angle90MachineGun,
  6: SuperMachineGun,
  7: MachineGun,
  8: SuperMachineGun,
  9: MachineGun,
};

if (CONFIG.env === 'dev') {
  WeaponsByClass = {
    1: MachineGun,
    2: SuperMachineGun,
    3: SuperMachineGun,
    4: SuperMachineGun,
    5: Angle90MachineGun,
    6: SuperMachineGun,
    7: MachineGun,
    8: SuperMachineGun,
    9: RocketLauncher,
  };
}


var PlayerCar = function(gameServer, client, playerName, player) {
  this.player = player;
  this.client = client;
  this.isBot = !this.client;
  this.gameServer = gameServer;
  this.car = new Car(this);
  gameServer.engine.addBody(this.car);
  this.playerName = playerName || 'car' + Math.floor(Math.random() * 1e5);
  this.id = this.car.id;
  this.reset();
  this.fbId = 0;
  this.userDb = null;
  this.loadFromSessionUser();
  if (this.client !== null) {
    this.FBInit();
  }
}

PlayerCar.prototype.addHighScore = function(score) {
  if (this.userDb !== null){
    this.userDb.highScore += score;
  }
};

PlayerCar.prototype.getMiniInfo = function() {
  return {
    fbId : this.fbId,
    name : this.playerName
  }
};


PlayerCar.prototype.saveVictory = function() {
  if (!this.isBot) {
    this.player.saveVictory()
  }
  this.saveUserDb();
}


PlayerCar.prototype.reset = function() {
  this.score = 0;
  this.experience = 0;
  this.level = 1;
  this.updateWeapon();
  this.dead = false;
  this.life = 100;
  this.maxLife = 100;
  this.shootingWithWeapon = null;
};

PlayerCar.prototype.getShared = function() {
  var share = this.car.getShared();
  share.life = this.life;
  share.maxLife = this.maxLife;  
  share.shootingWithWeapon = this.shootingWithWeapon;
  share.playerName = this.playerName;
  share.s = this.score;
  share.l = this.level;
  share.dead = this.dead;
  if (!KLib.isUndefined(this.car.carImageName)) {
    share.carImageName = this.car.carImageName;
  }
  share.gunLife = this.weapon.weaponEnergy;
  this.weaponShootOff();
  share.weaponName = this.weapon.name;
  share.isBot = this.isBot;
  if (this.userDb !== null){
    share.highScore = this.userDb.highScore;
  }
  return share;
}

PlayerCar.prototype.updatePos = function() {
  if (!this.dead && this.car !== null) {
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
  if (this.experience >= 100) {
    this.levelUp();
  }
  if (this.experience < 0) {
    this.levelDown();
  }
}

PlayerCar.prototype.updateWeapon = function() {
  var WeaponClass = WeaponsByClass[this.level];
  this.weapon = new WeaponClass(this.gameServer);
  if (this.shootingWithWeapon) {
    // when level up while shooting, directly update the current shooting weapon
    this.weaponShootOn();
  }
}

PlayerCar.prototype.levelUp = function() {
  if (this.level >= CONFIG.gameMaxLevel) {
    this.gameServer.gameEnd(this);
  } else {
    this.level += 1;
    this.updateWeapon();
    this.experience = 0;
  }
}

PlayerCar.prototype.levelDown = function() {
  this.level -= 1;
  if (this.level == 0) {
    this.level = 1;
  }
  this.updateWeapon();
  this.experience = 0;
}

PlayerCar.prototype.shoot = function() {
  this.weapon.shoot(this);
}

PlayerCar.prototype.weaponShootOn = function() {
  this.shootingWithWeapon = this.weapon.name;
};

PlayerCar.prototype.weaponShootOff = function() {
  this.shootingWithWeapon = null;
};


PlayerCar.prototype.rebornIn = function(seconds) {
  setTimeout(function() {
    if (this.isBot || this.player.connected) {
      this.dead = false;
      this.life = 100;
      this.car.goToFreeLandingPoint();
    }
  }.bind(this), seconds * 1000);
};

PlayerCar.prototype.die = function() {
  this.getExperience(-50);
  this.dead = true;
  if (this.player.client) {
    this.player.client.keyboard = {};
    this.player.client.emit('dead', null);
  }
  this.rebornIn(5);
}

require('./PlayerCarFacebook')(PlayerCar);
require('./PlayerCarDb')(PlayerCar);

module.exports = PlayerCar;
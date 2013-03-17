var KLib = require('./../KLib');
var sys = require("sys");
var KPhysicalBody = require('./KarmaPhysicalBody');

var Bullet = function(playerCar, pos, angle) {
    KLib.extend(KPhysicalBody, this);
    this.playerCar = playerCar;
    var size = {
      w: 0.1,
      h: 0.1
    };
    this.initialize(this.playerCar.gameServer.kengine, pos, size);
    this.isBullet = true;
    this.name = 'bullet';
    this.r = angle;
    this.life = 25;
    this.damage = 5;
  }


Bullet.prototype.die = function() {
  this.life = -1;
  this.scheduleForDestroy();
};

Bullet.prototype.explode = function() {
  this.die();
  this.playerCar.gameServer.broadcastExplosion(this.getPosition());
};

module.exports = Bullet;
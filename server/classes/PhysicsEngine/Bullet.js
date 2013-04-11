var KLib = require('./../KLib');
var sys = require("sys");
var KPhysicalBody = require('./KarmaPhysicalBody');

var Bullet = function(playerCar, pos, angle) {
    // angle = -0.9252754126021274;
    // KLib.extend(KPhysicalBody, this);
    this.playerCar = playerCar;
    // var size = {
    //   w: 0.1,
    //   h: 0.1
    // };
    this.x = pos.x;
    this.y = pos.y;
    // this.initialize(this.playerCar.gameServer.engine, pos, size);
    this.isBullet = true;
    this.name = 'bullet';
    this.r = angle;
    this.life = 2;
    this.damage = 5;
    this.len = 10;
    // this.p1 = {
    //   x: this.x,
    //   y: this.y
    // }
    // var len = 5;
    // var getOtherPoint = function(center, r, len) {
    //     var p = {
    //       x: center.x + Math.cos(r) * len,
    //       y: center.y + Math.sin(r) * len
    //     };
    //     return p;
    //   }
    // this.p2 = getOtherPoint(this.p1, this.r, this.len);
    // // this.p3 = getOtherPoint(this.p1, this.r, len);
    // this.line = this.engine.getLine(this.p1, this.p2);
    this.pBullet = {
      x: this.x,
      y: this.y
    }
    this.vBullet = {
      x: Math.cos(this.r) * this.len,
      y: Math.sin(this.r) * this.len
    }
  }

Bullet.prototype.performCollideAction = function(oldPosition) {
  // TODO: remove this function
  if(this.collidesWith.name === 'car' || this.collidesWith.name === 'bot') {
    if(this.collidesWith.id !== this.playerCar.car.id) {
      var playerCar = this.collidesWith.playerCar;
      playerCar.gameServer.carManager.projectileHitCar(this.playerCar, playerCar, this);
      this.explode();
    }
  } else {
    this.explode();
  }
  return true;
};

Bullet.prototype.die = function() {
  this.life = -1;
  this.scheduleForDestroy();
};

Bullet.prototype.explode = function(p) {
  // this.die();
  // var p = this.getPosition();
  this.playerCar.gameServer.broadcastExplosion(p);
};

module.exports = Bullet;
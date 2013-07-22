var sys = require("sys");
var KLib = require('./../../KLib');
var KBody = require('./../Body');

var Bullet = function(playerCar, pos, angle) {
    // angle = -0.9252754126021274;
    // KLib.extend(KBody, this);
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
    this.damage = 500;
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
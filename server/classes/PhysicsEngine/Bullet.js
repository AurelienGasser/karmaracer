var backbone = require('backbone');
var _ = require('underscore');
var sys = require("sys");
var b2d = require("box2d");

var Bullet = require("./PhysicsItem").extend({
  urlRoot: '/cars',
  initialize: function(playerCar, pos, angle) {
    var car = playerCar.car;
    var initPos = pos;
    this.acc_helper = 100;
    var a = {
      physicsEngine: car.engine,
      position: {
        x: car.getPosition().x + initPos.x,
        y: car.getPosition().y + initPos.y
      },
      size: {
        w: 0.1,
        h: 0.1
      },
      density: 1,
      friction: 5,
      bullet: true
    };
    this.playerCar = playerCar;
    this.name = 'bullet';
    this.constructor.__super__.initialize.apply(this, [a]);
    this.angle = angle;
    this.life = 25;
    this.damage = 5;
  },
  die : function(){
    this.life = -1;
    this.scheduleForDestroy();
  },
  explode: function(point) {
    this.die();
    this.engine.gameServer.broadcastExplosion(point);
  },
  accelerate: function(ac) {
    this.acc_helper += 2;
    var v = {
      x: this.acc_helper * ac * Math.cos(this.angle),
      y: this.acc_helper * ac * Math.sin(this.angle)
    };
    this.applyForceToBody(v);
  }
});

module.exports = Bullet;
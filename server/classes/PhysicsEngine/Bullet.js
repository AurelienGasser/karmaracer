var backbone = require('backbone');
var _ = require('underscore');
var sys = require("sys");
var b2d = require("box2d");



var Bullet = require("./PhysicsItem").extend({
  urlRoot: '/cars',
  initialize: function(playerCar) {
    var car = playerCar.car;
    var distanceFromCar = 1.2;
    var initPos = car.getVector({
      x: distanceFromCar * car.size.w,
      y: distanceFromCar * car.size.w
    });
    this.acc_helper = 100;
    //console.log(initPos);
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
      friction: 5
    };
    this.playerCar = playerCar;
    this.name = 'bullet';
    this.constructor.__super__.initialize.apply(this, [a]);
    this.angle = car.getAngle();
    this.life = 25;
    this.dead = false;
  },
  die : function(){
    this.life = -1;
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
    //console.log(v);
    this.applyForceToBody(v);
  }
});

module.exports = Bullet;
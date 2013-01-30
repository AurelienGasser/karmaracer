var backbone = require('backbone');
var _ = require('underscore');
var sys = require("sys");



var Bullet = require("./physicsItem").extend({
  urlRoot: '/cars',
  initialize: function(car) {
    var distanceFromCar = 2;
    var initPos = car.getVector({
      x: distanceFromCar * car.size.w,
      y: distanceFromCar * car.size.w
    });
<<<<<<< HEAD
    this.acc_helper = 5;
    this.name = 'bullet';
=======
    this.acc_helper = 100;
>>>>>>> fee60abcf7796e18fad765f87c45a6254dc160ad
    //console.log(initPos);
    var a = {
      physicsEngine: car.engine,
      position: {
        x: car.getPosition().x + initPos.x,
        y: car.getPosition().y + initPos.y
      },
      size: {
        w: 0.2,
        h: 0.2
      },
      density: 0,
      friction: 0,
      restitution:0
    };
    this.car = car;
    this.name = 'bullet';
    this.constructor.__super__.initialize.apply(this, [a]);
    this.angle = car.getAngle();
    this.life = 200;
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
    this.acc_helper += this.acc_helper;
    var v = {
      x: this.acc_helper * ac * Math.cos(this.angle),
      y: this.acc_helper * ac * Math.sin(this.angle)
    };
    //console.log(v);
    this.applyForceToBody(v);
  }
});

module.exports = Bullet;
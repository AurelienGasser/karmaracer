var backbone = require('backbone');
var _ = require('underscore');
var sys = require("sys");
var b2d = require("box2d");



var Bullet = require("./physicsItem").extend({
  urlRoot: '/cars',
  initialize: function(car) {
    var initPos = car.getVector(20);
    this.acc_helper = 5000;
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
      density: 1,
      friction: 1
    };
    this.constructor.__super__.initialize.apply(this, [a]);
    this.angle = car.getAngle();
    this.life = 200;
    this.dead = false;
  },
  accelerate: function(ac) {
    this.acc_helper += 5000;
    var v = {
      x: this.acc_helper * ac * Math.cos(this.angle),
      y: this.acc_helper * ac * Math.sin(this.angle)
    };
    //console.log(v);
    this.applyForceToBody(v);
  }
});

module.exports = Bullet;
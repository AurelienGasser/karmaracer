var backbone = require('backbone');
var _ = require('underscore');
var sys = require("sys");
var b2d = require("box2d");


var Bullet = require("./physicsItem").extend({
  urlRoot : '/cars',
  initialize : function(car){
    var a = {physicsEngine : car.engine, position : {x : car.getPosition().x, y : car.getPosition().y}, size:{w : 5, h : 5}, density:0.0001, friction:1};
    this.constructor.__super__.initialize.apply(this, [a]);
    this.angle = car.getAngle();
    this.life = 200;
    this.dead = false;
  },
  accelerate : function (ac){
    var acc_helper = 5000;    
    var v = {x : acc_helper * ac * Math.cos(this.angle), y : acc_helper * ac * Math.sin(this.angle)};
    //console.log(v);
    this.applyForceToBody(v);
  }
});

module.exports = Bullet;


var backbone = require('backbone');
var _ = require('underscore');
var sys = require("sys");
var b2d = require("box2d");


var Car = require("./physicsItem").extend({
  urlRoot : '/cars',
  initialize : function(_physicsEngine){
    var a = {physicsEngine : _physicsEngine, position : {x : 60.0, y : 60.0}, size:{w : 16.75, h : 8.5}, density:0.0001, friction:1};
    this.constructor.__super__.initialize.apply(this, [a]);
    this.tireResistance = 1.8;
  },
  accelerationMax : 50,
  accelerate : function (ac){
    var acc_helper = 1000;
    var v = {x : acc_helper * ac * Math.cos(this.getAngle()), y : acc_helper * ac * Math.sin(this.getAngle())};
    //console.log(v);
    this.applyForceToBody(v);
  },
  updatePos : function(){
    this.reduceVelocityOfBody(this.tireResistance);
  }
});

module.exports = Car;


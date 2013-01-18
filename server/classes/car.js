var backbone = require('backbone');
var _ = require('underscore');
var sys = require("sys");
var b2d = require("box2d");


var Car = require("./physicsItem").extend({
  urlRoot: '/cars',
  initialize: function(_physicsEngine) {
    var a = {
      physicsEngine: _physicsEngine,
      position: {
        x: 10.0,
        y: 11.5
      },
      size: {
        w: 1,
        h: 0.5
      },
      density: 1,
      friction: 0.2
    };
    this.name = 'car';
    this.constructor.__super__.initialize.apply(this, [a]);
    this.tireResistance = 1.8;
    this.score = 0;
    this.playerName = 'car' + Math.floor(Math.random() * 1e5);
    this.life = 100;
  },
  accelerationMax: 50,
  accelerate: function(ac) {
    var acc_helper = 4;
    var v = {
      x: acc_helper * ac * Math.cos(this.getAngle()),
      y: acc_helper * ac * Math.sin(this.getAngle())
    };
    //console.log(v);
    this.applyForceToBody(v);
  },
  updatePos: function() {
    this.reduceVelocityOfBody(this.tireResistance);
  },
  updatePlayerName: function(name) {
    this.playerName = name;
  }
});

module.exports = Car;
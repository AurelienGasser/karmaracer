var backbone = require('backbone');
var _ = require('underscore');
var sys = require("sys");
var b2d = require("box2d");


var Car = require("./PhysicsItem").extend({
  startPosition: {
    x: 10.0,
    y: 11.5,
  },
  urlRoot: '/cars',
  initialize: function(playerCar) {
    var a = {
      physicsEngine: playerCar.gameServer.physicsEngine,
      position: this.startPosition,
      size: {
        w: 1,
        h: 0.5
      },
      density: 1,
      friction: 0.2
    };
    this.playerCar = playerCar;
    this.name = 'car';
    this.constructor.__super__.initialize.apply(this, [a]);
    this.tireResistance = 1.8;
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
  receiveHit: function() {
    this.playerCar.receiveHit();
  },
  getShared: function() {
   var res =  this.constructor.__super__.getShared.bind(this)();
   res.playerName = this.playerCar.playerName;
   return res;
  }
});

module.exports = Car;
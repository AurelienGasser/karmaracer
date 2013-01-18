var backbone = require('backbone');
var _ = require('underscore');
var sys = require("sys");
var b2d = require("box2d");


var Car = require("./physicsItem").extend({
  startPosition: {
    x: 10.0,
    y: 11.5,
  },
  urlRoot: '/cars',
  client: null,
  initialize: function(_physicsEngine, client) {
    var a = {
      physicsEngine: _physicsEngine,
      position: this.startPosition,
      size: {
        w: 1,
        h: 0.5
      },
      density: 1,
      friction: 0.2
    };
    this.name = 'car';
    this.client = client;
    this.physicsEngine = _physicsEngine;
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
  },
  receiveHit: function() {
    this.life -= 10;
    if (this.life <= 0) {
      if (this.client) {
        this.physicsEngine.gameServer.client_die(this.client);
      } else {
        // bot: do nothing, bots are invlunerable (for now ;)
      }
    }
  }
});

module.exports = Car;
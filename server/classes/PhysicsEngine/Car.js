var backbone = require('backbone');
var _ = require('underscore');
var sys = require("sys");
var box2d = require('box2dweb-commonjs');

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
      friction: 1,
      restitution: 0.2
    };
    this.playerCar = playerCar;
    this.name = 'car';
    this.constructor.__super__.initialize.apply(this, [a]);
    this.tireResistance = 1.8;
    this.createSensor();
  },
  accelerationMax: 50,
  accelerate: function(ac) {
    var acc_helper = 4;
    var v = {
      x: acc_helper * ac * Math.cos(this.getAngle()),
      y: acc_helper * ac * Math.sin(this.getAngle())
    };
    this.applyForceToBody(v);
  },
  updatePos: function() {
    this.reduceVelocityOfBody(this.tireResistance);
    this.body.ApplyTorque(-this.body.m_torque / 15);    
  },
  receiveHit: function() {
    this.playerCar.receiveHit();
  },
  getShared: function() {
   var res =  this.constructor.__super__.getShared.bind(this)();
   res.playerName = this.playerCar.playerName;
   return res;
  },
  createSensor: function() {
    var fixtureDef = new box2d.b2FixtureDef();
    fixtureDef.density = 0;
    fixtureDef.friction = 0;
    fixtureDef.restitution = 0;
    fixtureDef.shape = new box2d.b2PolygonShape();
    var h = 0.2;
    var w = 2;
    var vertices = [
        new box2d.b2Vec2(0, -h / 2)
      , new box2d.b2Vec2(w, -h / 2)
      , new box2d.b2Vec2(w,  h / 2)
      , new box2d.b2Vec2(0,  h / 2)
    ];
    fixtureDef.shape.SetAsVector(vertices, vertices.length);
    fixtureDef.isSensor = true;
    this.body.CreateFixture(fixtureDef);
  },
  stop: function() {
    this.playerCar.car.body.SetLinearVelocity(new box2d.b2Vec2(0, 0));
    this.playerCar.car.body.SetAngularVelocity(0);
  }
});

module.exports = Car;
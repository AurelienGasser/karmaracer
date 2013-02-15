var KLib = require('../KLib');
var sys = require("sys");
var box2d = require('box2dweb-commonjs');
var PhysicsItem = require('./PhysicsItem');


var Car = function(playerCar) {
    KLib.extend(PhysicsItem, this);
    this.startPosition = {
      x: 10.0,
      y: 11.5,
    };
    this.accelerationMax = 50;
    this.initialize(playerCar);
  }


Car.prototype.initialize = function(playerCar) {
  var a = {
    physicsEngine: playerCar.gameServer.physicsEngine,
    position: this.startPosition,
    size: {
      w: 1,
      h: 0.5
    },
    density: 1,
    friction: 1,
    restitution: 0
  };
  this.playerCar = playerCar;
  this.name = 'car';
  this.base.initialize.call(this, a);
  this.linearTireResistance = 0.4;

  this.angularTireResistance = 0.8;
  this.angularAcceleration = 0;
  this.maxAngularAcceleration = 1.7;
  this.angularAccelerationIncrement = 0.05;

  this.createSensor();
}

Car.prototype.accelerate = function(ac) {
  var acc_helper = 4;
  var v = {
    x: acc_helper * ac * Math.cos(this.getAngle()),
    y: acc_helper * ac * Math.sin(this.getAngle())
  };
  this.applyForceToBody(v);
}
Car.prototype.updateAngularAcceleration = function(turningRight) {
  if(this.turningRight != turningRight) {
    this.angularAcceleration = 0;
    this.turningRight = turningRight;
  }
  if(this.turningRight) {
    this.angularAcceleration = Math.min(this.angularAcceleration + this.angularAccelerationIncrement, this.maxAngularAcceleration);
  } else {
    this.angularAcceleration = Math.max(this.angularAcceleration - this.angularAccelerationIncrement, -this.maxAngularAcceleration);
  }
}
Car.prototype.turn = function(turningRight) {
  this.updateAngularAcceleration(turningRight);
  this.base.turn.bind(this)(this.angularAcceleration);
}
Car.prototype.updatePos = function() {
  this.reduceLinearVelocity(this.linearTireResistance);
  this.reduceAngularVelocity(this.angularTireResistance);
  if(this.body !== null) {
    this.body.ApplyTorque(-this.body.m_torque / 15);
  }
}
Car.prototype.receiveHit = function() {
  this.playerCar.receiveHit();
}
Car.prototype.getShared = function() {
  var res = this.base.getShared.call(this);
  res.playerName = this.playerCar.playerName;
  return res;
}
Car.prototype.createSensor = function() {
  if(this.body === null) {
    return;
  }
  var fixtureDef = new box2d.b2FixtureDef();
  fixtureDef.density = 0;
  fixtureDef.friction = 0;
  fixtureDef.restitution = 0;
  fixtureDef.shape = new box2d.b2PolygonShape();
  var h = 0.2;
  var w = 2;
  var vertices = [
  new box2d.b2Vec2(0, -h / 2), new box2d.b2Vec2(w, -h / 2), new box2d.b2Vec2(w, h / 2), new box2d.b2Vec2(0, h / 2)];
  fixtureDef.shape.SetAsVector(vertices, vertices.length);
  fixtureDef.isSensor = true;
  this.body.CreateFixture(fixtureDef);
}
Car.prototype.stop = function() {
  this.playerCar.car.body.SetLinearVelocity(new box2d.b2Vec2(0, 0));
  this.playerCar.car.body.SetAngularVelocity(0);
}

module.exports = Car;
// var backbone = require('backbone');
var KLib = require('../KLib');
var sys = require("sys");
// var PhysicsItem = require('./PhysicsItem');

var KPhysicalBody = require('./KarmaPhysicalBody');


var Rocket = function(playerCar, pos, angle) {
  KLib.extend(KPhysicalBody, this);
    this.initialize(playerCar, pos, angle);
  }

Rocket.prototype.initialize = function(playerCar, pos, angle) {
  var car = playerCar.car;
  var initPos = pos;
  this.acc_helper = 1;
  var a = {
    physicsEngine: car.engine,
    position: {
      x: car.getPosition().x + initPos.x,
      y: car.getPosition().y + initPos.y
    },
    size: {
      w: 0.5,
      h: 0.3
    },
    density: 1,
    friction: 5,
    angle: angle
  };
  this.playerCar = playerCar;
  this.name = 'rocket';
  // this.constructor.__super__.initialize.apply(this, [a]);
  this.initialize(playerCar.gameServer.kengine, a.position, a.size);
  this.angle = angle;
  this.life = 25;
  this.damage = 100;
};



module.exports = Rocket;
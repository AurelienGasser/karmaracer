var KLib = require('../../KLib');
var KBody = require('./../Body');

var Rocket = function(playerCar, pos, angle) {
  KLib.extend(KBody, this);
  this.initialize(playerCar, pos, angle);
}

Rocket.prototype.initialize = function(playerCar, pos, angle) {
  var car = playerCar.car;
  var initPos = pos;
  this.acc_helper = 1;
  var a = {
    Engine: car.engine,
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
  this.initialize(playerCar.gameServer.engine, a.position, a.size);
  this.angle = angle;
  this.life = 25;
  this.damage = 100;
};

module.exports = Rocket;
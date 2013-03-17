var KLib = require('../KLib');
var sys = require("sys");
var KPhysicalBody = require('./KarmaPhysicalBody');

var Car = function(playerCar) {
  KLib.extend(KPhysicalBody, this);
  this.startPosition = {
    x: 10.0,
    y: 11.5,
  };
  this.playerCar = playerCar;
  this.name = 'car';
  this.initialize(this.playerCar.gameServer.kengine, this.startPosition, { w: 1, h: 0.5 });
  return this;
}



Car.prototype.turn = function(turningRight) {
  this.base.turn.bind(this)((turningRight ? 1 : -1) * Math.PI / 128)
}

Car.prototype.receiveHit = function() {
  this.playerCar.receiveHit();
}

Car.prototype.getShared = function() {
  var res = this.base.getShared.call(this);
  res.playerName = this.playerCar.playerName;
  return res;
}

module.exports = Car;
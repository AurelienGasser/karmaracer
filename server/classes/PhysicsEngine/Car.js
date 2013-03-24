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
    this.initialize(this.playerCar.gameServer.kengine, this.startPosition, {
      w: 1,
      h: 0.5
    });
    this.name = 'car';
    this.goToFreeLandingPoint();
    this.isBot = playerCar.isBot;
    return this;
  }

Car.prototype.goToFreeLandingPoint = function() {
  if(this.engine !== null) {
    var currentPosition = this.getPosition();    
    var res = this.engine.checkCollisions(this);
    if(res) {
      this.resetCollisions();
      var pos = {
        x: (Math.random() * 1e10) % this.engine.size.w,
        y: (Math.random() * 1e10) % this.engine.size.h,
        r: 0
      };
      this.setPosition(pos);
      this.goToFreeLandingPoint(pos);
    }
  }
};

Car.prototype.turn = function(turningRight) {
  this.base.turn.bind(this)((turningRight ? 1 : -1) * Math.PI / 128)
}

Car.prototype.receiveHit = function() {
  this.playerCar.receiveHit();
}

Car.prototype.getShared = function() {
  var res = this.base.getShared.call(this);
  res.playerName = this.playerCar.playerName;
  res.s = this.playerCar.score;
  res.l = this.playerCar.level;
  return res;
}

module.exports = Car;
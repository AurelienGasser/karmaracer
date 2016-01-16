var KLib = require('../../KLib');
var KBody = require('./../Body');
var config = require('../../../../config');

var Car = function(playerCar) {
  KLib.extend(KBody, this);
  this.startPosition = {
    x: 5.0,
    y: 11.5,
  };
  this.playerCar = playerCar;
  this.initialize(this.playerCar.gameServer.engine, this.startPosition, {
    w: Car.prototype.w,
    h: Car.prototype.h
  });
  this.name = 'car';
  this.goToFreeLandingPoint();
  this.isBot = playerCar.isBot;
  this.carImageName = 'c1';
  return this;
};

Car.prototype.w = 1;
Car.prototype.h = 0.5;

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

Car.prototype.receiveHit = function() {
  this.playerCar.receiveHit();
}

Car.prototype.getFrontCorners = function(pos) {
  var front = {
    x: pos.x + this.w / 2 * Math.cos(this.r),
    y: pos.y + this.w / 2 * Math.sin(this.r)
  }
  var diagonal = Math.sqrt((this.w / 2) * (this.w / 2) + (this.h / 2) * (this.h / 2));
  return {
    left: {
      x: front.x + this.h / 2 * Math.cos(this.r + Math.PI / 2),
      y: front.y + this.h / 2 * Math.sin(this.r + Math.PI / 2)
    },
    right: {
      x: front.x + this.h / 2 * Math.cos(this.r - Math.PI / 2),
      y: front.y + this.h / 2 * Math.sin(this.r - Math.PI / 2)
    }
  };
}


module.exports = Car;
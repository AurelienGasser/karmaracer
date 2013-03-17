var KLib = require('./../KLib');
var sys = require("sys");
// var PhysicsItem = require('./PhysicsItem');
var KPhysicalBody = require('./KarmaPhysicalBody');

var Bullet = function(playerCar, pos, angle) {
    KLib.extend(KPhysicalBody, this);

    this.playerCar = playerCar;
    this.name = 'bullet';
    this.r = angle;
    this.life = 25;
    this.damage = 5;

    var car = this.playerCar.car;
    var initPos = pos;
    var position = {
      x: car.x + initPos.x,
      y: car.y + initPos.y
    };
    var size = {
      w: 0.1,
      h: 0.1
    };
    this.initialize(this.playerCar.gameServer.kengine, position, size);

  }

// Bullet.prototype.step = function() {
//   if(!KLib.isUndefined(this.acceleration)) {
//     this.accelerate(this.acceleration);
//   }
//   this.base.step.bind(this)();
//   // console.log('step');
// };

// Bullet.prototype.accelerate = function(ac) {
//   this.acceleration = ac;
//   this.base.accelerate.bind(this)(ac);
// };



// Bullet.prototype.initialize = function(playerCar, pos, angle) {
//   var car = playerCar.car;
//   var initPos = pos;
//   this.acc_helper = 100;
//   var a = {
//     physicsEngine: car.engine,
//     position: {
//       x: car.getPosition().x + initPos.x,
//       y: car.getPosition().y + initPos.y
//     },
//     size: {
//       w: 0.1,
//       h: 0.1
//     },
//     density: 0.01,
//     friction: 0,
//     bullet: true
//   };
//   this.playerCar = playerCar;
//   this.name = 'bullet';
//   this.base.initialize.call(this.playerCar.gameServer.kengine, a.position, a.size);
//   this.angle = angle;
//   this.life = 25;
//   this.damage = 5;
// };
Bullet.prototype.die = function() {
  this.life = -1;
  this.scheduleForDestroy();
};

Bullet.prototype.explode = function(point) {
  this.die();
  this.engine.gameServer.broadcastExplosion(point);
};
// Bullet.prototype.accelerate = function(ac) {
//   this.acc_helper += 2;
//   var v = {
//     x: this.acc_helper * ac * Math.cos(this.angle),
//     y: this.acc_helper * ac * Math.sin(this.angle)
//   };
//   // this.applyForceToBody(v);
// }
module.exports = Bullet;
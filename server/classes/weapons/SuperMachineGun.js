var Bullet = require('../PhysicsEngine/Bullet');
var Heritage = require('../Heritage');
var Weapon = require('./Weapon');


var SuperMachineGun = function() {
    Heritage.extend(Weapon, this);
    this.name = 'super machine gun';
  }

SuperMachineGun.prototype.shoot = function(playerCar) {
  var distanceFromCar = playerCar.car.size.w / 2;
  var PI = 3.14;
  var angle1 = -PI / 4;
  var angle2 = PI / 4;
  var pos1 = playerCar.car.getVector({
    x: distanceFromCar * playerCar.car.size.w,
    y: distanceFromCar * playerCar.car.size.w
  }, angle1);
  var pos2 = playerCar.car.getVector({
    x: distanceFromCar * playerCar.car.size.w,
    y: distanceFromCar * playerCar.car.size.w
  }, angle2);
  var pos3 = playerCar.car.getVector({
    x: distanceFromCar * playerCar.car.size.w,
    y: distanceFromCar * playerCar.car.size.w
  });
  var b1 = new Bullet(playerCar, pos1, playerCar.car.getAngle() + angle1);
  var b2 = new Bullet(playerCar, pos2, playerCar.car.getAngle() + angle2);
  var b3 = new Bullet(playerCar, pos3, playerCar.car.getAngle());
  b1.accelerate(1);
  b2.accelerate(1);
  b3.accelerate(1);
  this.bullets[b1.id] = b1;
  this.bullets[b2.id] = b2;
  this.bullets[b3.id] = b3;
}

module.exports = SuperMachineGun;
var Rocket = require('../PhysicsEngine/Rocket');

var MachineGun = function() {
  this.name = 'rocket launcher';
  this.rockets = [];
  this.lastShot = null;
}

MachineGun.prototype.step = function() {
  var deads = [];
  for (var id in this.rockets) {
    if (this.rockets.hasOwnProperty(id)) {
      var rocket = this.rockets[id];
      if (rocket.body === null) {
        deads.push(id);
      } else {
        rocket.accelerate(1);
        --rocket.life;
        if (rocket.life <= 0) {
          rocket.scheduleForDestroy();
          deads.push(id);
        }
      }
    }
  }
  for (var i = 0; i < deads.length; i++) {
    var id = deads[i];
    delete this.rockets[id];
  };
}

MachineGun.prototype.shoot = function(playerCar) {
  var now = (new Date()).getTime();
  if (now - this.lastShot > 1000) {
    this.lastShot = now;
    var distanceFromCar = 1.2;
    var pos = playerCar.car.getVector({
      x: distanceFromCar * playerCar.car.size.w,
      y: distanceFromCar * playerCar.car.size.w
    });
    var b = new Rocket(playerCar, pos, playerCar.car.getAngle());
    b.accelerate(0.1);
    this.rockets[b.id] = b;
  }
}

MachineGun.prototype.getGraphicRockets = function() {
  var rockets = [];
  for (var id in this.rockets) {
    if(this.rockets.hasOwnProperty(id)) {
      var rocket = this.rockets[id];
      rockets.push(rocket.getShared());
    }
  }
  return rockets;
}

module.exports = MachineGun;
var Car = require('./classes/PhysicsEngine/Car');

var CarManager = function(gameServer) {
  this.gameServer = gameServer;
  this.playerCars = {};
  this.botCars = {};
}

CarManager.prototype.getShared = function() {
  var cars = [];
  function addCars(list) {
    for(var id in list) {
      var c = list[id];
      cars.push(c.getShared());
    }
  }
  addCars(this.playerCars);
  addCars(this.botCars);
  return cars;
}

CarManager.prototype.updatePos = function() {
  for(var id in this.playerCars) {
    var playerCar = this.playerCars[id];
    playerCar.updatePos();
  }
}

CarManager.prototype.add = function(playerCar) {
  this.playerCars[playerCar.car.id] = playerCar;
}

CarManager.prototype.remove = function(playerCar) {
  delete this.playerCars[playerCar.car.id];
}

CarManager.prototype.addBot = function(bot) {
  this.botCars[bot.car.id] = bot.car;
}

CarManager.prototype.projectileHitCar = function(attacker, victim, projectile) {
  attacker.score += 1;
  victim.receiveHit();
  if (victim.life <= 0) {
    if (victim.player.client) {
      if (victim.dead) {
        return;
      }
      var that = this;
      victim.dead = true;
      victim.car.destroy();
      this.remove(victim);
      victim.player.client.emit('dead', null);
      setTimeout(function() {
        victim.dead = false;
        victim.car = new Car(victim);
        victim.life = 100;
        that.add(victim);
      }, 5000);

    } else {
      // bot: do nothing, bots are invlunerable (for now ;)
    }
  }
}

module.exports = CarManager;
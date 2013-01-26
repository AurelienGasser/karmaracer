var Car = require('./classes/PhysicsEngine/Car');

var CarManager = function(gameServer) {
  this.gameServer = gameServer;
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
  addCars(this.getAlivePlayerCars());
  addCars(this.botCars);
  return cars;
}

CarManager.prototype.getAlivePlayerCars = function() {
  var aliveCars = [];
  for (var i in this.gameServer.players) {
    var player = this.gameServer.players[i];
    var playerCar = player.playerCar;
    if (!playerCar.dead) {
      aliveCars.push(playerCar)
    }
  }
  return aliveCars;
}

CarManager.prototype.updatePos = function() {
  var playerCars = this.getAlivePlayerCars();
  for(var id in playerCars) {
    var playerCar = playerCars[id];
    playerCar.updatePos();
  }
}

CarManager.prototype.addBot = function(bot) {
  this.botCars[bot.car.id] = bot.car;
}

CarManager.prototype.projectileHitCar = function(attacker, victim, projectile) {
  attacker.score += 1;
  victim.receiveHit(projectile.damage);
  if (victim.life <= 0) {
    if (victim.player.client) {
      if (victim.dead) {
        return;
      }
      victim.die();
      attacker.getExperience(100);
    } else {
      // bot: do nothing, bots are invlunerable (for now ;)
    }
  }
}

module.exports = CarManager;
var Car = require('./classes/PhysicsEngine/Car');

var CarManager = function(gameServer) {
    this.gameServer = gameServer;
  }

CarManager.prototype.getShared = function() {
  var cars = [];

  function addCars(list) {
    for(var id in list) {
      var c = list[id];
      if(c.playerCar !== null && c.playerCar.car !== null) {
        if(!c.playerCar.dead) {
          var share = c.playerCar.getShared();
          share.s = c.playerCar.score;
          share.l = c.playerCar.level;
          cars.push(share);
        }
      }
    }
  }
  addCars(this.gameServer.players);
  addCars(this.gameServer.botManager.bots);
  return cars;
}

CarManager.prototype.getAliveCars = function(source) {
  var aliveCars = [];
  for(var i in source) {
    var player = source[i];
    var playerCar = player.playerCar;
    if(!playerCar.dead) {
      aliveCars.push(playerCar)
    }
  }
  return aliveCars;
}

CarManager.prototype.updatePos = function() {
  for(var id in this.gameServer.players) {
    var playerCar = this.gameServer.players[id].playerCar;
    playerCar.updatePos();
  }
}

CarManager.prototype.projectileHitCar = function(attacker, victim, projectile) {
  attacker.score += 1;
  victim.receiveHit(projectile.damage);
  if(victim.life <= 0) {
    if(victim.dead) {
      return;
    }
    victim.die();
    attacker.getExperience(100);
  }
}

module.exports = CarManager;
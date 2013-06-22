var Car = require('./classes/PhysicsEngine/Car');

var CarManager = function(gameServer) {
  this.gameServer = gameServer;
}

CarManager.prototype.getShared = function() {
  var cars = [];

  function addCars(list) {
    for (var id in list) {
      var c = list[id];
      if (c.playerCar !== null && c.playerCar.car !== null) {
        var share = c.playerCar.getShared();
        cars.push(share);
      }
    }
  }
  addCars(this.gameServer.players);
  addCars(this.gameServer.botManager.bots);
  return cars;
}

CarManager.prototype.getAliveCars = function(source) {
  var aliveCars = [];
  for (var i in source) {
    var player = source[i];
    var playerCar = player.playerCar;
    if (!playerCar.dead) {
      aliveCars.push(playerCar)
    }
  }
  return aliveCars;
}

CarManager.prototype.savePlayersInDb = function() {
  for (var pcID in this.gameServer.players) {
    var pc = this.gameServer.players[pcID];
    pc.playerCar.saveUserDb();
  }
};


CarManager.prototype.projectileHitCar = function(attacker, victim, projectile) {
  attacker.score += 1;
  attacker.addHighScore(1);
  victim.receiveHit(projectile.damage);
  if (victim.life <= 0) {
    if (victim.dead) {
      return;
    }
    victim.die();
    this.gameServer.broadcast('car_killed', {
      victim: victim.getMiniInfo(),
      attacker: attacker.getMiniInfo()
    });
    attacker.getExperience(100);
  }
}

module.exports = CarManager;
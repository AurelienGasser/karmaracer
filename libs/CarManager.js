var Car = require('./classes/Physics/Bodies/Car');

var CarManager = function(gameServer) {
  this.gameServer = gameServer;
}


CarManager.prototype.addCars = function(list, mapMethod, cars) {
  for (var id in list) {
    var c = list[id];
    if (c.playerCar !== null && c.playerCar.car !== null) {
      var share = c.playerCar[mapMethod]();
      cars.push(share);
    }
  }
};

CarManager.prototype.mapCars = function(mapMethod) {
  var cars = [];
  this.addCars(this.gameServer.players, mapMethod, cars);
  this.addCars(this.gameServer.botManager.bots, mapMethod, cars);
  return cars;
};

CarManager.prototype.getShared = function() {
  return this.mapCars('getShared');
}

CarManager.prototype.getGameInfo = function() {
  var gameInfo = {};
  var cars = this.mapCars('getGameInfo');
  for (var i = 0; i < cars.length; i++) {
    var c = cars[i];
    gameInfo[c.id] = c;
  };
  // console.log(cars.length, Object.keys(gameInfo).length);
  return gameInfo;
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
    pc.playerCar.FBSetHighScore();
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
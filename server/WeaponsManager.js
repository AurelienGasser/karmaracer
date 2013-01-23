var WeaponsManager = function(gameServer) {
  this.gameServer = gameServer;
}

WeaponsManager.prototype.step = function() {
  for (var i in this.gameServer.clients) {
    var client = this.gameServer.clients[i];
    if (client.player) {
      var playerCar = client.player.playerCar;
      playerCar.weapon.step();
    }
  }
}

WeaponsManager.prototype.getGraphicProjectiles = function() {
  var projectiles = {
    bullets: [],
    rockets: []
  };
  for (var i in this.gameServer.clients) {
    var client = this.gameServer.clients[i];
    if (client.player) {
      var playerCar = client.player.playerCar;
      var weapon = playerCar.weapon;
      switch (weapon.name) {
        case 'machine gun':
        case 'super machine gun':
          projectiles.bullets = projectiles.bullets.concat(weapon.getGraphicBullets());
          break;
        case 'rocket launcher':
          projectiles.rockets = projectiles.rockets.concat(weapon.getGraphicRockets());
          break;
      }
    }
  }
  return projectiles;
}

module.exports = WeaponsManager;
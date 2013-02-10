var WeaponsManager = function(gameServer) {
  this.gameServer = gameServer;
}

WeaponsManager.prototype.step = function() {
  for (var i in this.gameServer.players) {
    var player = this.gameServer.players[i];
    if (player) {
      var client = player.client;
      player.playerCar.weapon.step();
    }
  }
}

WeaponsManager.prototype.getGraphicProjectiles = function() {
  var projectiles = {
    bullets: [],
    rockets: []
  };
  for (var i in this.gameServer.players) {
    var player = this.gameServer.players[i];
    if (player) {
      var weapon = player.playerCar.weapon;
      switch (weapon.name) {
        case 'machine gun':
        case 'super machine gun':
          projectiles.bullets = projectiles.bullets.concat(weapon.getGraphics());
          break;
        case 'rocket launcher':
          projectiles.rockets = projectiles.rockets.concat(weapon.getGraphics());
          break;
      }
    }
  }
  return projectiles;
}

module.exports = WeaponsManager;
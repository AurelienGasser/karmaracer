var WeaponsManager = function(gameServer) {
  this.gameServer = gameServer;
}

WeaponsManager.prototype.step = function() {
  for (var i in this.gameServer.clients) {
    var playerCar = this.gameServer.clients[i].player.playerCar;
    playerCar.weapon.step();
  }
}

WeaponsManager.prototype.getGraphicBullets = function() {
  var bullets = [];
  for (var i in this.gameServer.clients) {
    var playerCar = this.gameServer.clients[i].player.playerCar;
    var newBullets = playerCar.weapon.getGraphicBullets();
    bullets = bullets.concat(newBullets);
  }
  return bullets;
}

module.exports = WeaponsManager;
var WeaponsManager = function(gameServer) {
    this.gameServer = gameServer;
  }


WeaponsManager.prototype.stepList = function(list, action) {

  for(var i in list) {
    var player = list[i];
    if(player) {
      action(player);
    }
  }
};

WeaponsManager.prototype.step = function() {
  this.stepList(this.gameServer.players, function(player) {
    player.playerCar.weapon.step();
  });
  this.stepList(this.gameServer.botManager.bots, function(player) {
    player.playerCar.weapon.step();
  });
}


//   case '90 angle machine gun':
//   case 'machine gun':
//   case 'super machine gun':
WeaponsManager.prototype.getGraphicProjectiles = function() {
  function appendProjectilesShared(inputList, projectiles) {
    var p = [];
    for(var i in inputList) {
      var player = inputList[i];
      if(player) {
        var weapon = player.playerCar.weapon;
        var graphics = weapon.getGraphics();
        p = p.concat(graphics);
      }
    }
    projectiles = projectiles.concat(p);
    return projectiles;
  }
  var projectiles = [];
  projectiles = appendProjectilesShared(this.gameServer.players, projectiles);
  projectiles = appendProjectilesShared(this.gameServer.botManager.bots, projectiles);
  // console.log(projectiles.length);
  return projectiles;
}

module.exports = WeaponsManager;
var game;

function Game(){
  this.cars = [];
  this.mycar;
  this.walls = [];
  this.drawEngine;
  this.socketManager = new SocketManager(G_serverHost, this, this.onInitReceived);
  document.onkeydown = handleKeyDown;
  document.onkeyup = handleKeyUp;
}

Game.prototype.onInitReceived = function(err, world) {
  // once socket init has been done
  G_game.drawEngine = DrawEngineFactory(G_game, "game-canvas", G_defaultDrawEngineType);
  G_game.drawEngine.camera.setWorldSize(world.size);

  if (G_MOBILE_DEVICE){
    setInterval(function(){
      if(G_game.socketManager.getConnection() != null){
        if (diff_driveSide <= -maxTurn) diff_driveSide = -maxTurn;
        if (diff_driveSide >= maxTurn) diff_driveSide = maxTurn;
        $('#touch-debug').html('turn: '+  diff_driveSide + ", acc:" + localAcceleration);
        G_game.socketManager.getConnection().emit('accelerate', localAcceleration);
        G_game.socketManager.getConnection().emit('turnCar', diff_driveSide);
      }
      }, 10);
    }

  G_game.drawEngine.tick();
};


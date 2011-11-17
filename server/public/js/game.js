function Game(){
  this.cars = [];
  this.mycar;
  this.walls = [];
  this.drawEngine;
  this.socketManager = new SocketManager(G_serverHost, this, this.onInitReceived);
  document.onkeydown = handleKeyDown;
  document.onkeyup = handleKeyUp;
}

Game.prototype.onInitReceived = function(err, worldInfo) {
  // once socket init has been done  
  G_game.world = {};
  G_game.world.size = worldInfo.size;
  G_game.walls = worldInfo.walls;
  G_game.drawEngine = DrawEngineFactory(G_game, "game-canvas", G_defaultDrawEngineType);


  if (G_MOBILE_DEVICE){
    setInterval(function(){
      if (diff_driveSide != 0 || localAcceleration != 0){
        if(G_game.socketManager.getConnection() != null){
          if (diff_driveSide <= -maxTurn) diff_driveSide = -maxTurn;
          if (diff_driveSide >= maxTurn) diff_driveSide = maxTurn;
          $('#touch-debug').html('turn: '+  diff_driveSide + ", acc:" + localAcceleration);          
          G_game.socketManager.getConnection().emit('drive', {'accelerate' :localAcceleration, 'turnCar': diff_driveSide});
        }        
      }
    }, 5);
    Engine2DCanvasTick();    
  }else{
    G_game.drawEngine.tick();          
  }
  

};


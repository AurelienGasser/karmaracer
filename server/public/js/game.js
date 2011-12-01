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

  //console.log(worldInfo);
  G_game.world = {};
  G_game.world.size = worldInfo.size;
  G_game.walls = worldInfo.staticItems;
  G_game.itemsInMap = worldInfo.itemsInMap;
  
  G_game.drawEngine = DrawEngineFactory(G_game, "game-canvas", G_defaultDrawEngineType);

  var bgImage = new Image();
  bgImage.src = worldInfo.backgroundImage;
  bgImage.onload = function(){
    var bgPattern = G_game.drawEngine.ctx.createPattern(this,'repeat');
    G_game.backgroundPattern = bgPattern;    
  }

  _.each(G_game.itemsInMap, function(i, item){
      var img = new Image();
      img.src = i.image.path;
      img.onload = function(){
        var _pattern = G_game.drawEngine.ctx.createPattern(img,'repeat');d
        G_game.itemsInMap[item].pattern = _pattern;        
      }
  }.bind(this));

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


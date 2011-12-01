function Game(){
  this.cars = [];
  this.mycar;
  this.walls = [];
  this.drawEngine;
  this.socketManager = new SocketManager(G_serverHost, this, this.onInitReceived);
}

Game.prototype.onInitReceived = function(err, worldInfo) {
  // once socket init has been done
  G_game.world = {};
  G_game.world.size = worldInfo.size;
  G_game.walls = worldInfo.staticItems;
  G_game.itemsInMap = worldInfo.itemsInMap;
  
  G_game.drawEngine = DrawEngineFactory(G_game, "game-canvas", G_defaultDrawEngineType);

  // create background pattern
  var bgImage = new Image();
  bgImage.src = worldInfo.backgroundImage;
  bgImage.onload = function(){
    var bgPattern = G_game.drawEngine.ctx.createPattern(this,'repeat');
    G_game.backgroundPattern = bgPattern;    
  }

  // enhance items with patterns
  _.each(G_game.itemsInMap, function(i, item){
      var img = new Image();
      img.src = i.image.path;
      img.onload = function(){
        var _pattern = G_game.drawEngine.ctx.createPattern(img,'repeat');d
        G_game.itemsInMap[item].pattern = _pattern;        
      }
  }.bind(this));


  
  G_game.keyboardHandler = new KeyboardHandler();
  document.onkeydown = G_game.keyboardHandler.handleKeyDown.bind(G_game.keyboardHandler);
  document.onkeyup = G_game.keyboardHandler.handleKeyUp.bind(G_game.keyboardHandler);
  G_game.drawEngine.tick();
};


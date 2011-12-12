function GameInstance(){
  this.cars = [];
  this.mycar;
  this.walls = [];
  this.drawEngine;
  this.socketManager = new SocketManager(G_serverHost, this, this.onInitReceived);
}

GameInstance.prototype.onInitReceived = function(err, worldInfo) {
  // once socket init has been done
  G_gameInstance.world = {};
  G_gameInstance.world.size = worldInfo.size;
  G_gameInstance.walls = worldInfo.staticItems;
  G_gameInstance.itemsInMap = worldInfo.itemsInMap;
  
  G_gameInstance.drawEngine = DrawEngineFactory(G_gameInstance, "game-canvas", G_defaultDrawEngineType);

  // create background pattern
  var bgImage = new Image();
  bgImage.src = worldInfo.backgroundImage;
  bgImage.onload = function(){
    var bgPattern = G_gameInstance.drawEngine.ctx.createPattern(this,'repeat');
    G_gameInstance.backgroundPattern = bgPattern;    
  }

  // enhance items with patterns
  _.each(G_gameInstance.itemsInMap, function(i, item){
      var img = new Image();
      img.src = i.image.path;
      img.onload = function(){
        var _pattern = G_gameInstance.drawEngine.ctx.createPattern(img,'repeat');
        G_gameInstance.itemsInMap[item].pattern = _pattern;        
      }
  }.bind(this));

  G_gameInstance.keyboardHandler = new KeyboardHandler();
  document.onkeydown = G_gameInstance.keyboardHandler.handleKeyDown.bind(G_gameInstance.keyboardHandler);
  document.onkeyup = G_gameInstance.keyboardHandler.handleKeyUp.bind(G_gameInstance.keyboardHandler);
  G_gameInstance.drawEngine.tick();
};


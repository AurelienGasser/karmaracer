function GameInstance(){
  this.cars = [];
  this.mycar;
  this.walls = [];
  this.drawEngine;
  this.socketManager = new SocketManager(G_serverHost, this, this.onInitReceived.bind(this));
}

GameInstance.prototype.onInitReceived = function(err, worldInfo) {
  // once socket init has been done
  this.world = {};
  this.world.size = worldInfo.size;
  this.walls = worldInfo.staticItems;
  this.itemsInMap = worldInfo.itemsInMap;
  this.drawEngine = DrawEngineFactory(this, "game-canvas", G_defaultDrawEngineType);

  // create background pattern
  var bgImage = new Image();
  bgImage.src = worldInfo.backgroundImage;
  var game = this;
  bgImage.onload = function(){
    var bgPattern = game.drawEngine.ctx.createPattern(this, 'repeat');
    game.backgroundPattern = bgPattern;
  };

  // enhance items with patterns
  _.each(this.itemsInMap, function(i, item){
      var img = new Image();
      img.src = i.image.path;
      img.onload = function(){
        var _pattern = this.drawEngine.ctx.createPattern(img, 'repeat');
        this.itemsInMap[item].pattern = _pattern;
      }.bind(this)
  }.bind(this));

  this.keyboardHandler = new KeyboardHandler(this);
  document.onkeydown = this.keyboardHandler.handleKeyDown.bind(this.keyboardHandler);
  document.onkeyup = this.keyboardHandler.handleKeyUp.bind(this.keyboardHandler);
  this.drawEngine.tick();
};


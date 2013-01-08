function GameInstance() {
  this.cars = [];
  this.mycar;
  this.walls = [];
  this.drawEngine;
  this.socketManager = new SocketManager(G_serverHost, this, this.onInitReceived.bind(this));
}


GameInstance.prototype.loadImages = function(callback) {

  var that = this;

  var imagesNumToLoad = Object.keys(this.itemsInMap).length + 1;
  var imageNumLoaded = 0;

  function imageLoaded() {
    //console.log(imageNumLoaded, imagesNumToLoad);
    if(imageNumLoaded === imagesNumToLoad - 1) {
      return callback();
    }
    imageNumLoaded += 1;

  }


  // create background pattern
  var bgImage = new Image();
  bgImage.src = that.worldInfo.backgroundImage;
  var game = this;
  bgImage.onload = function() {
    var bgPattern = game.drawEngine.ctx.createPattern(this, 'repeat');
    game.backgroundPattern = bgPattern;
    imageLoaded();
  };

  // enhance items with patterns
  _.each(this.itemsInMap, function(i, item) {
    var img = new Image();
    img.src = i.image.path;
    img.onload = function() {
      var _pattern = this.drawEngine.ctx.createPattern(img, 'repeat');
      this.itemsInMap[item].pattern = _pattern;
      imageLoaded();
    }.bind(this)
  }.bind(this));
};

GameInstance.prototype.onInitReceived = function(err, worldInfo) {
  console.log(worldInfo);
  // once socket init has been done
  this.world = {};
  this.worldInfo = worldInfo;
  this.world.size = worldInfo.size;
  this.walls = worldInfo.staticItems;
  this.itemsInMap = worldInfo.itemsInMap;

  var that = this;
  that.drawEngine = DrawEngineFactory(that, "game-canvas", G_defaultDrawEngineType);

  that.loadImages(function() {
    that.drawEngine.initBackgroundCanvas();

    //console.log('ready');
    that.keyboardHandler = new KeyboardHandler(that);
    document.onkeydown = that.keyboardHandler.handleKeyDown.bind(that.keyboardHandler);
    document.onkeyup = that.keyboardHandler.handleKeyUp.bind(that.keyboardHandler);
    that.drawEngine.tick();

  });

};
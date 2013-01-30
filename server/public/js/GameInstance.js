function GameInstance() {
  this.cars = [];
  this.explosions = {};
  this.mycar;
  this.walls = [];
  this.drawEngine;
  this.socketManager = new SocketManager(G_serverHost, this, this.onInitReceived.bind(this));
  this.setUIEvents();
  setInterval(function() {
    for (var explosionId in this.explosions) {
      this.explosions[explosionId].alpha -= 0.1;
      if (this.explosions[explosionId].alpha < 0) {
        delete this.explosions[explosionId];
      }
    }
  }.bind(this), 60)
}


GameInstance.prototype.setUIEvents = function() {
  var that = this;
  $('#player_name').keyup(function(e){
    that.socketManager.emit('updatePlayerName', $(this).val());
  });
};

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
      //console.log(i);
      if(i.patternType !== 'none') {
        var _pattern = this.drawEngine.ctx.createPattern(img, 'repeat');
        this.itemsInMap[item].pattern = _pattern;
      } else {
        this.itemsInMap[item].pattern = null;
        this.itemsInMap[item].img = img;
      }
      imageLoaded();
    }.bind(this)
  }.bind(this));
};

GameInstance.prototype.onInitReceived = function(err, worldInfo) {
  var that = this;

  this.world = {};
  this.worldInfo = worldInfo;
  this.world.size = worldInfo.size;
  this.walls = worldInfo.staticItems;
  this.itemsInMap = worldInfo.itemsInMap;
  this.bullets = []

  that.drawEngine = DrawEngineFactory(that, "game-canvas", G_defaultDrawEngineType);

  that.loadImages(function() {
<<<<<<< HEAD
    //    that.drawEngine.initBackgroundCanvas();
    //console.log('ready');
=======
>>>>>>> fee60abcf7796e18fad765f87c45a6254dc160ad
    that.keyboardHandler = new KeyboardHandler(that);
    document.onkeydown = that.keyboardHandler.handleKeyDown.bind(that.keyboardHandler);
    document.onkeyup = that.keyboardHandler.handleKeyUp.bind(that.keyboardHandler);
    that.drawEngine.tick();
  });
};

GameInstance.prototype.addExplosion = function(explosion) {
  var that = this;
  var explosionId = Math.random();
  this.explosions[explosionId] = {
    x: explosion.x,
    y: explosion.y,
    r: 3.14 / 6 * Math.random() - 3.14,
    alpha: 0.4 * Math.random() - 0.2 + 0.25
  };
  }

function GameInstance() {
  this.cars = [];
  this.explosions = {};
  this.walls = [];
  this.drawEngine;
  this.socketManager = new SocketManager(this, this.onInitReceived.bind(this));
  this.setUIEvents();

  this.isMobile = false;

  this.scoresTable = $('tbody#scores');

  // function html5_audio() {
  //   var a = document.createElement('audio');
  //   return !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));
  // }
  // this.play_html5_audio = false;
  // if(html5_audio()) this.play_html5_audio = true;
  // this.sounds = {};
  // this.setSound('ta', '/sounds/ta.mp3');
  var that = this;

  function reduceExplosionsAlpha() {
    // console.log(that.explosions);
    for(var explosionId in that.explosions) {
      that.explosions[explosionId].alpha -= 0.1;
      if(that.explosions[explosionId].alpha < 0) {
        delete that.explosions[explosionId];
      }
    }
  }

  setInterval(reduceExplosionsAlpha, 60);
}

GameInstance.prototype.setSound = function(name, url) {
  var sound;
  if(this.play_html5_audio) {
    sound = new Audio(url);
    sound.load();
  } else {
    sound = $("<embed id='" + name + "' type='audio/mpeg' />");
    sound.attr('src', url);
    sound.attr('loop', false);
    sound.attr('hidden', true);
    sound.attr('autostart', false);
    sound.attr('enablejavascript', true);
    $('body').append(sound);
  }
  this.sounds[name] = sound;
};

GameInstance.prototype.play_sound = function(url) {

  if(this.play_html5_audio) {
    var snd = new Audio(url);
    snd.load();
    snd.play();
  } else {
    $("#sound").remove();
    var sound = $("<embed type='audio/mpeg' />");
    sound.attr('src', url);
    sound.attr('loop', false);
    sound.attr('hidden', true);
    sound.attr('autostart', true);
    $('body').append(sound);
  }
};

GameInstance.prototype.updateScoresHTML = function() {
  var that = this;
  function getScores() {
    var scores = _.map(that.cars, function(car) {
      return {
        'score': car.s,
        'level': car.l,
        'name': car.playerName
      };
    });
    scores = _.sortBy(scores, function(c) {
      return c.score;
    }).reverse();
    return scores;
  }
  var scores = getScores();
  var o = [];
  for(var i = 0; i < scores.length; i++) {
    var playerScore = scores[i];
    var userCarClass = (that.myCar !== null && that.myCar.playerName === playerScore.name) ? 'userCar' : '';
    o.push('<tr class="', userCarClass, '"><td>', playerScore.name, '</td><td>', playerScore.score, '</td><td>', playerScore.level, '</td></tr>');
  };
  this.scoresTable.html(o.join(''));
};


GameInstance.prototype.updatePlayerName = function(name) {
  this.socketManager.emit('updatePlayerName', name);
  Karma.set('playerName', name);
};

GameInstance.prototype.setUIEvents = function() {
  var that = this;
  $('#player_name').keyup(function(e) {
    that.updatePlayerName($(this).val());
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
  bgImage.src = that.worldInfo.background.path;
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
  this.physicsEngine = new PhysicsEngine(this, worldInfo.physicalConfig);
  this.bullets = []
  this.rockets = []

  that.drawEngine = DrawEngineFactory(that, "game-canvas", G_defaultDrawEngineType);

  that.loadImages(function() {
    that.keyboardHandler = new KeyboardHandler(that);
    document.onkeydown = that.keyboardHandler.handleKeyDown.bind(that.keyboardHandler);
    document.onkeyup = that.keyboardHandler.handleKeyUp.bind(that.keyboardHandler);
    that.drawEngine.tick();
  });
};

GameInstance.prototype.addExplosion = function(explosion) {
  // this.play_sound("/sounds/prou.mp3");
  var that = this;
  var explosionId = Math.random();
  this.explosions[explosionId] = {
    x: explosion.x,
    y: explosion.y,
    r: 3.14 / 6 * Math.random() - 3.14,
    alpha: 0.4 * Math.random() - 0.2 + 0.25
  };
}
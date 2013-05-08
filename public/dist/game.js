var KLib = {};

KLib.isFunction = function(obj) {
  return typeof obj === 'function';
};

//http://jsperf.com/tests-for-undefined/2
KLib.isUndefined = function(obj) {
  return obj === void 0;
};

function GameInstance() {
  TopBar.setTopBar();
  this.cars = [];
  this.explosions = {};
  this.mycar = undefined;
  this.walls = [];
  this.drawEngine = undefined;
  this.socketManager = new SocketManager(this, this.onInitReceived.bind(this));
  this.setUIEvents();

  this.isMobile = false;

  this.scoresTable = $('tbody#scores');
  this.projectiles = [];

  this.loadCars();
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
    for (var explosionId in that.explosions) {
      that.explosions[explosionId].alpha -= 0.1;
      if (that.explosions[explosionId].alpha < 0) {
        delete that.explosions[explosionId];
      }
    }
  }

  setInterval(reduceExplosionsAlpha, 60);
}


GameInstance.prototype.loadCars = function() {
  var that = this;
  var getCar = function(name, imageName, w, h){
    return {
      name: name,
      path: '/sprites/' + imageName,
      w: w,
      h: h
    };
  };
  var registerCar = function(car) {
    that.carsImages[car.name] = car;
  };

  this.carsImages = {};
  registerCar(getCar('c1', 'car.png', 128, 64));
  registerCar(getCar('c2', 'car2.png', 82, 36));
  registerCar(getCar('c3', 'car3.png', 72, 32));
  registerCar(getCar('c4', 'car4.png', 74, 34));
  registerCar(getCar('c5', 'car5.png', 81, 35));
};

GameInstance.prototype.setSound = function(name, url) {
  var sound;
  if (this.play_html5_audio) {
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

  if (this.play_html5_audio) {
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
        'name': car.playerName,
        'highScore': car.highScore,
        'id' : car.id
      };
    });
    scores = _.sortBy(scores, function(c) {
      return c.score;
    }).reverse();
    return scores;
  }
  var scores = getScores();
  var o = [];
  for (var i = 0; i < scores.length; i++) {
    var playerScore = scores[i];
    var userCarClass = (that.mycar !== null && that.mycar.id === playerScore.id) ? 'userCar' : '';
    o.push('<tr class="', userCarClass, '"><td>', playerScore.name, '</td><td>', playerScore.score, '</td><td>', playerScore.level, '</td><td>', playerScore.highScore, '</td></tr>');
  }
  this.scoresTable.html(o.join(''));
};


GameInstance.prototype.updatePlayerName = function(name) {
  this.socketManager.emit('updatePlayerName', name);
  Karma.set('playerName', name);
};

GameInstance.prototype.setUIEvents = function() {
  var that = this;
  $('#playerName').keyup(function(e) {
    that.updatePlayerName($(this).val());
  });
};

GameInstance.prototype.loadImages = function(callback) {

  var that = this;

  var imagesNumToLoad = Object.keys(this.itemsInMap).length + 1;
  var imageNumLoaded = 0;

  function imageLoaded() {
    if (imageNumLoaded === imagesNumToLoad - 1) {
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
      if (i.patternType !== 'none') {
        var _pattern = this.drawEngine.ctx.createPattern(img, 'repeat');
        this.itemsInMap[item].pattern = _pattern;
      } else {
        this.itemsInMap[item].pattern = null;
        this.itemsInMap[item].img = img;
      }
      imageLoaded();
    }.bind(this);
  }.bind(this));
};

GameInstance.prototype.onInitReceived = function(err, worldInfo) {
  var that = this;

  this.world = {};
  this.worldInfo = worldInfo;
  this.world.size = worldInfo.size;
  this.walls = worldInfo.staticItems;
  this.itemsInMap = worldInfo.itemsInMap;
  this.bullets = [];
  this.rockets = [];

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
};;

$(window).on('beforeunload', function() {
  connection.emit('disconnect');
});

var connection;

function SocketManager(gameInstance, onInitCallback) {
  var host = window.location.hostname;
  connection = io.connect(host);

  this.gameInstance = gameInstance;
  this.init_done = false;
  this.socketCounter = 0;
  this.timestamp = new Date().getTime();
  this.msg_id = 0;
  this.gameInstance.bodies = [];

  var that = this;

  function socketReceived() {
    var now = new Date().getTime();
    if (now - that.timestamp > 1000) {
      that.timestamp = now;
      $('#socketps').html('socket/ps: ' + that.socketCounter);
      that.socketCounter = 0;
    }
    that.socketCounter += 1;
  }

  $('#debug').append('<div id="socketps" class="info"></div>');
  $('#debug').append('<div id="debug-sockets" class="info">sockets</div>');

  connection.on('connect', function(data) {
    if (!_.isUndefined(G_mapName)) {
      connection.emit('enter_map', G_mapName);
      announce('Shoot them all !', 'blue');
    }

  });

  connection.on('init', function(worldInfo) {
    onInitCallback(null, worldInfo);
    if (!Karma.get('playerName') || Karma.get('playerName').length === 0) {
      Karma.set('playerName', prompt('Welcome to Karmaracer !\nWhat\'s your name ?'));
    }
    connection.emit('init_done', {
      playerName: Karma.get('playerName')
    });
    this.init_done = true;
  });

  connection.on('chat_msg', function(msg) {
    var key = 'msg_' + that.msg_id;
    onChatMsgReceived(msg, key);
    ++that.msg_id;
  });

  function announce(text, color, extraClass) {
    if (KLib.isUndefined(extraClass)) {
      extraClass = '';
    }
    $('#announce').remove();
    var div = $('<div id="announce" class=" ' + extraClass + ' announce-' + color + '"><span>' + text + '</span></div>');
    // div.hide();
    div.appendTo($('body'));
    
    // div.fadeIn(function() {
    setTimeout(function() {
      $('#announce').fadeOut(function() {
        $('#announce').remove();
      });
    }, 4000);
    // });

  }

  connection.on('dead', function() {
    announce('You\' re dead !', 'red');
  });

  function announceIn(msg, color, timeInSeconds, extraClass, callback) {
    setTimeout(function() {
      announce(msg, color, extraClass);
      if (KLib.isFunction(callback)) {
        return callback(null);
      }
    }, timeInSeconds * 1000);

  }

  connection.on('game end', function(d) {

    $('table.scores').addClass('big').removeClass('default');

    var removeBigScore = function(err) {
      $('table.scores').removeClass('big').addClass('default');
    };

    announce(d.winnerName + ' wins the game !!!!', 'black', 'freeze');
    announceIn('2', 'red', 3, 'freeze');
    announceIn('1', 'orange', 4, 'freeze', removeBigScore);
    announceIn('GO', 'green', 5, '');

  });

  connection.on('objects', function(objects) {
    gameInstance.cars = objects.cars;
    gameInstance.mycar = objects.myCar;
    gameInstance.projectiles = objects.projectiles;
    gameInstance.collisionPoints = objects.collisionPoints;
    gameInstance.updateScoresHTML();
    $('#debug-sockets').html(JSON.stringify(_.map(objects, function(list) {
      return list ? list.length : 0;
    })));
    socketReceived();
  });

  connection.on('explosion', function(explosion) {
    gameInstance.addExplosion(explosion);
  });

  this.connection = connection;
}

SocketManager.prototype.getConnection = function() {
  return this.connection;
};

SocketManager.prototype.emit = function(key, data) {
  this.connection.emit(key, data);
};

$(function() {
  $('#addBot').click(function() {
    connection.emit('add bot');
  });
  $('#removeBot').click(function() {
    connection.emit('remove bot');
  });
});
;

var SteeringWheelController = function(gameInstance) {

  // this.init(gameInstance);

};

SteeringWheelController.prototype.init = function(gameInstance) {
  this.m = $('<div id="SteeringWheelController"/>');
  this.acc = $('<div id="SteeringWheelControllerAcc"/>');

  this.m.append(this.acc);

  this.enable = false;
  $('body').append(this.m);
  this.gameInstance = gameInstance;
  this.gameInstance.steeringWheel = this;
  this.resize();
  this.accSize = {
    w: this.acc.width(),
    h: this.acc.height()
  };

  this.force = {
    x: 0,
    y: 0
  };

  this.updateCenter();

  var that = this;


  var toogleEnable = function(e) {
    var jWheel = $(this);
    jWheel.toggleClass('enable');
    that.enable = jWheel.hasClass('enable');
  };

  that.m.click(toogleEnable);

  $(window).resize(function() {
    that.resize();
  });

  window.onorientationchange = function() {
    // alert('update');
    that.resize();
  };

  window.webkitfullscreenchange = function() {
    // alert('o??');
  };

  var interval = null;



  var send = function() {
    if (!that.enable) {
      return;
    }
    that.gameInstance.socketManager.emit('move_car', {
      'force': that.force,
      'angle': angle(that.force)
    });
  };

  var startAcceleration = function(e) {
    // alert('start');
    if (interval === null) {
      interval = setInterval(send, 1000 / 16);
    }

  };
  var stopAcceleration = function(e) {
    clearInterval(interval);
    interval = null;
  };



  function angle(b) {
    if (b === null) {
      return 0;
    }
    a = {
      'x': 0,
      'y': 0
    };
    res = Math.atan2(b.y, b.x) - Math.atan2(a.y, a.x);
    if (_.isNaN(res)) {
      res = 0;
    }
    return res;
  }


  var hover = function(e) {


    var mousePosition = {
      x: e.pageX,
      y: e.pageY
    };

    if (that.gameInstance.isMobile) {
      mousePosition.x = e.originalEvent.touches[0].pageX;
      mousePosition.y = e.originalEvent.touches[0].pageY;
    }

    var x = mousePosition.x - that.mCenter.x;
    var y = mousePosition.y - that.mCenter.y;

    that.acc.css('left', mousePosition.x - that.m.position().left - (that.accSize.w / 2));
    that.acc.css('top', mousePosition.y - that.m.position().top - (that.accSize.h / 2));

    var force = {
      'x': (x / (that.mSize.w / 2)),
      'y': (y / (that.mSize.h / 2))
    };
    var accHelper = 10;
    if (that.gameInstance.isMobile) {
      accHelper = 5;
    }
    force.x *= accHelper;
    force.y *= accHelper;
    that.force = force;
  };
  console.info('is mobile', that.gameInstance.isMobile);
  if (that.gameInstance.isMobile) {
    that.m.bind('touchstart', startAcceleration);
    that.m.bind('touchend', stopAcceleration);
    that.m.bind('touchmove', hover);
    that.enable = true;
  } else {
    that.m.mousemove(hover);
    that.m.hover(startAcceleration, stopAcceleration);
  }
  that.acc.mousemove(function(e) {
    e.preventDefault();
    return false;
  });

};

SteeringWheelController.prototype.setMSize = function(w, h) {
  var that = this;

  that.m.css('width', w + 'px');
  that.m.css('height', h + 'px');

  that.mSize = {
    w: that.m.width(),
    h: that.m.height()
  };

  that.updateCenter();
};



SteeringWheelController.prototype.updateCenter = function() {

  var that = this;

  that.mSize = {
    w: that.m.width(),
    h: that.m.height()
  };
  that.mCenter = {
    x: that.mSize.w / 2 + that.m.position().left,
    y: that.mSize.h / 2 + that.m.position().top
  };
};

SteeringWheelController.prototype.setMPosition = function(x, y) {
  var that = this;
  var mX = x - that.mSize.w / 2;
  var mY = y - that.mSize.h / 2;
  that.m.css('left', mX + 'px');
  that.m.css('top', mY + 'px');
  that.updateCenter();
};



SteeringWheelController.prototype.resize = function() {
  this.m.css({
    'width': '100%',
    'height': '100%'
  });
  // this.setMSize(this.m.width(), this.m.height());
  // this.setMPosition(window.innerWidth / 2, window.innerHeight / 2);
};;

KEY_ENTER = 13;
KEY_SPACE = 32;
KEY_LEFT = 37;
KEY_RIGHT = 39;
KEY_UP = 38;
KEY_DOWN = 40;
KEY_ESCAPE = 27;
KEY_L = 76;
KEY_P = 80;
KEY_B = 66;

function KeyboardHandler(gameInstance) {
  this.gameInstance = gameInstance;
  return this;
}

KeyboardHandler.prototype.sendKeyboardEvent = function(event, state) {
  if(connection) {
    connection.emit('drive', event, state);
  }
};




KeyboardHandler.prototype.handleKey = function(key, state) {
  var that = this;
  switch(key) {
  case KEY_B:
    this.sendKeyboardEvent('break', state);
    break;
  case KEY_SPACE:
    this.sendKeyboardEvent('shoot', state);
    break;
  case KEY_LEFT:
    this.sendKeyboardEvent('left', state);
    break;
  case KEY_RIGHT:
    this.sendKeyboardEvent('right', state);
    break;
  case KEY_UP:
    this.sendKeyboardEvent('forward', state);
    break;
  case KEY_DOWN:
    this.sendKeyboardEvent('backward', state);
    break;
  case KEY_L:
    if (state == 'start') {
      this.gameInstance.drawEngine.camera.scale *= 1.05;
    }
    break;
  case KEY_P:
    if (state == 'start') {
      this.gameInstance.drawEngine.camera.scale *= 0.95;
    }
    break;
  default:
    //console.info(key);
  }
};

KeyboardHandler.prototype.handleKeyDown = function(event) {
  switch(event.keyCode) {
  case KEY_ESCAPE:
    clearChatInputField();
    hideChat();
    break;
  case KEY_UP:
  case KEY_DOWN:
    if ($('#chat_input').is(':focus')) {
      hideChat();
    }
    this.handleKey(event.keyCode, 'start');
    break;
  case KEY_ENTER:
    if ($('#chat_input').is(':focus')) {
      sendMsg();
    } else {
      showChat();
    }
    break;
  case KEY_L:
  case KEY_P:
  case KEY_SPACE:
    if (!$('#chat_input').is(':focus')) {
      this.handleKey(event.keyCode, 'start');
    }
    break;
  default:
    this.handleKey(event.keyCode, 'start');
  }
};

KeyboardHandler.prototype.handleKeyUp = function(event) {
  this.handleKey(event.keyCode, 'end');
};;

document.ontouchstart = function(e){ 
    e.preventDefault(); 
};

var G_gameInstance;

Modernizr.load([{
  load: '/js/libs/jquery-1.6.4.min.js',
  complete: function() {
    Modernizr.load([{
      test: $("html.touch").length,
      yep: ['/js/mobile.js', '/js/mobile_compatibility.js', '/css/mobile.css'],
      nope: ['css/no-touch.css'],
      complete: function() {
        G_gameInstance = new GameInstance();
        if(typeof(MobileTerminalHandler) === 'function') {
          var mobileHandler = new MobileTerminalHandler(G_gameInstance);
          mobileHandler.init();
        }
        var steeringWheel  = new SteeringWheelController(G_gameInstance);
      }
    }]);
  }
}]);


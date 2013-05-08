var KLib = {};

KLib.isFunction = function(obj) {
  return typeof obj === 'function';
};

//http://jsperf.com/tests-for-undefined/2
KLib.isUndefined = function(obj) {
  return obj === void 0;
};

KLib.extend = function(Parent, child) {
    function construct(constructor, args) {
      function F() {
        return constructor.apply(this, args);
      }
      F.prototype = constructor.prototype;
      return new F();
    }
    var p = construct(Parent, Array.prototype.slice.call(arguments, 2));
    child.base = {};
    for (var prop in p) {
      if (KLib.isUndefined(child[prop])) {
        var value = p[prop];
        child[prop] = value;
      } else {
        child.base[prop] = Parent.prototype[prop];
      }
    }
  };

;

var Karma = function() {
  if (_.isUndefined(localStorage.karma)) {
    this.karma = {};
  } else {
    this.karma = JSON.parse(localStorage.karma);
  }
  var that = this;

  function get(v) {
    return that.karma[v];
  }

  function exists(key) {
    var v = get(key);
    if (v === void 0) {
      return false;
    } else {
      return true;
    }
  }

  function save() {
    localStorage.karma = JSON.stringify(that.karma);
  }

  function set(key, value) {
    that.karma[key] = value;
    save();
  }
  return {
    'get': get,
    'set': set,
    'exists' : exists
  };
}();
;


var MiniMap;
(function() {

  MiniMap = function($container) {
    this.$container = $container;

    this.$container.append('<canvas class="miniMap"></canvas>');
  };




}());
;

function sendMsg() {
  if ($('#chat_input').val().trim() !== '') {
    var msg = (Karma.get('playerName')) + ': ' + $('#chat_input').val();
    G_gameInstance.socketManager.emit('chat', msg);
  }
  $('#chat_input').val('');
  hideChat();
}

function onChatMsgReceived(msg, key) {
  $('#chat_msgs').append('<li id="' + key + '">' + msg + '</li>');
  setTimeout(function() {
    $('li#' + key).fadeOut(500, function() {
      $('li#' + key).remove();
    });
  }, 20000);
}

function showChat() {
  $('#chat_input_label').html((Karma.get('playerName')) + ' :');
  $('#chat_input_wrapper').show();
  $('#chat_input').focus();
  // $('#chat_input_label_wrapper').css('display', 'inline-block');

  $('#chat_input_wrapper').addClass('enable');
}

function hideChat() {
  $('#chat_input').blur();
  $('#chat_input_wrapper').hide();
  $('#chat_input_wrapper').removeClass('enable');
}

function clearChatInputField() {
  $('#chat_input').val('');
}
;

function setGoogleAnalytics() {
  // Google Analytics
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-27170619-1']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
  })();
}

setGoogleAnalytics();
;

function MobileTerminalHandler(gameInstance) {
  this.gameInstance = gameInstance;
  this.gameInstance.isMobile = true;
  // alert('mobile');
  // return this;
}

MobileTerminalHandler.prototype.init = function() {
  // this.gameInstance.isMobile = true;
  $('#addBot').remove();
  $('#removeBot').remove();
  $('#left_panel').remove();
  $('#player_name_div').remove();

  // $("head").append('<meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=0.0"');
  // $("head").append('<meta name="apple-mobile-web-app-capable" content="yes"');
  $('head').append('<link rel="apple-touch-icon" href="/images/karmaracer-logo.png"/>');
  $('body').attr('onorientationchange', 'updateOrientation(G_gameInstance)');
  // $("body").append('<div id="camera-debug"/>');
  // this.touch = {
  //   forward: false,
  //   backward: false,
  //   left: false,
  //   right: false
  // }
  // this.addTouchScreenAreas();
  // this.initTouchScreenEvents();
  // $('#debug').remove();
};

MobileTerminalHandler.prototype.addTouchScreenAreas = function() {
  $('body').append('<div id="touch-debug">toto</div>');
  // $("body").append('<div id="pad-turn" class="pad">TURN</div>');
  // $("body").append('<div id="pad-accelerate" class="pad">ACCELERATE</div>');
  // $("body").append('<div id="pad-zoom" class="pad">ZOOM</div>');
};


// Turn left, stop turning or turn right depending on the event position
MobileTerminalHandler.prototype.touchEventTurn = function(event) {
  if (
  event.originalEvent.targetTouches[0].pageY < event.target.offsetTop || event.originalEvent.targetTouches[0].pageY > event.target.offsetTop + event.target.clientHeight || event.originalEvent.targetTouches[0].pageX < event.target.offsetLeft || event.originalEvent.targetTouches[0].pageX > event.target.offsetLeft + event.target.clientWidth) {
    this.userTurn('stop');
  } else if (event.originalEvent.targetTouches[0].pageX < event.target.offsetLeft + event.target.clientWidth / 2) {
    this.userTurn('left');
  } else {
    this.userTurn('right');
  }
};

// Accelerate, stop or descelerate depending on the event position
MobileTerminalHandler.prototype.touchEventAccelerate = function(event) {
  if (
  event.originalEvent.targetTouches[0].pageY < event.target.offsetTop || event.originalEvent.targetTouches[0].pageY > event.target.offsetTop + event.target.clientHeight || event.originalEvent.targetTouches[0].pageX < event.target.offsetLeft || event.originalEvent.targetTouches[0].pageX > event.target.offsetLeft + event.target.clientWidth) {
    this.userAccelerate('stop');
  } else if (event.originalEvent.targetTouches[0].pageY < event.target.offsetTop + event.target.clientHeight / 2) {
    this.userAccelerate('forward');
  } else {
    this.userAccelerate('backward');
  }
};

// Send a turn instruction to the server if necessary
MobileTerminalHandler.prototype.userTurn = function(direction) {
  switch (direction) {
    case 'stop':
      if (this.touch.left) this.gameInstance.keyboardHandler.event('left', 'end');
      if (this.touch.right) this.gameInstance.keyboardHandler.event('right', 'end');
      break;
    case 'left':
      if (this.touch.right) this.gameInstance.keyboardHandler.event('right', 'end');
      if (!this.touch.left) this.gameInstance.keyboardHandler.event('left', 'start');
      break;
    case 'right':
      if (this.touch.left) this.gameInstance.keyboardHandler.event('left', 'end');
      if (!this.touch.right) this.gameInstance.keyboardHandler.event('right', 'start');
      break;
  }
  this.touch.left = false;
  this.touch.right = false;
  if (direction != 'stop') this.touch[direction] = true;
};

// Send an accelerate instruction to the server if necessary
MobileTerminalHandler.prototype.userAccelerate = function(direction) {
  switch (direction) {
    case 'stop':
      if (this.touch.forward) this.gameInstance.keyboardHandler.event('forward', 'end');
      if (this.touch.backward) this.gameInstance.keyboardHandler.event('backward', 'end');
      break;
    case 'forward':
      if (this.touch.backward) this.gameInstance.keyboardHandler.event('backward', 'end');
      if (!this.touch.forward) this.gameInstance.keyboardHandler.event('forward', 'start');
      break;
    case 'backward':
      if (this.touch.forward) this.gameInstance.keyboardHandler.event('forward', 'end');
      if (!this.touch.backward) this.gameInstance.keyboardHandler.event('backward', 'start');
      break;
  }
  this.touch.forward = false;
  this.touch.backward = false;
  if (direction != 'stop') this.touch[direction] = true;
};

MobileTerminalHandler.prototype.initTouchScreenEvents = function() {
  window.ontouchmove = function(e) {
    e.preventDefault();
  };
  window.touchstart = function(e) {
    e.preventDefault();
  };
  $('#pad-accelerate').bind('touchstart', function(event) {
    this.touchEventAccelerate(event);
  }.bind(this));
  $('#pad-accelerate').bind('touchend', function() {
    this.userAccelerate('stop');
  }.bind(this));
  $('#pad-accelerate').bind('touchmove', function(event) {
    this.touchEventAccelerate(event);
  }.bind(this));
  $('#pad-turn').bind('touchstart', function(event) {
    this.touchEventTurn(event);
  }.bind(this));
  $('#pad-turn').bind('touchend', function() {
    this.userTurn('stop');
  }.bind(this));
  $('#pad-turn').bind('touchmove', function(event) {
    this.touchEventTurn(event);
  }.bind(this));
  $('#pad-zoom').bind('touchstart', function(event) {
    this.zoomLevel = event.pageX;
  });
  $('#pad-zoom').bind('touchmove', function(event) {
    var zoomFactor;
    if (this.zoomLevel - event.pageX < 0) {
      zoomFactor = 1.05;
    } else {
      zoomFactor = 0.95;
    }
    this.gameInstance.drawEngine.camera.scale *= zoomFactor;
  });
};

function updateOrientation(gameInstance) {
  window.scrollTo(0, 0);
  gameInstance.steeringWheel.resize();
  if (gameInstance.drawEngine.camera !== null) {
    gameInstance.drawEngine.camera.resizeCanvas({
      w: $(window).width(),
      h: $(window).height()
    });
  }
};


if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }
    var fSlice = Array.prototype.slice,
    aArgs = fSlice.call(arguments, 1),
    fToBind = this,
    fNOP = function() {},
    fBound = function() {
      return fToBind.apply(this instanceof fNOP ? this : oThis || window,
      aArgs.concat(fSlice.call(arguments)));
    };
    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
    return fBound;
  };
}
;

var TopBar = {};

(function() {


  function getPageName() {
    var url = document.URL;
    var list = url.split('/');
    var page = list[list.length - 1];
    if (page.indexOf('#') !== -1) {
      page = page.split('#')[0];
    }
    return page;
  }


  function setTopBar() {
    var o = [];
    o.push('<div id="topBar" class="init"><ul id="topBarBoxes">');

    var page = getPageName();
    if (page !== '') {
      o.push('<li id="topHelp"><a href="/"><img src="/images/iconHome.png" id="iconHome"/></a></li>');
    }

    o.push('<li><form id="playerNameForm" href="#">');
    o.push('Welcome to Karma Racer, <input title="change your name here" id="playerName" type="text" placeholder="Your name" required="required" name="playerName" autocomplete="off"></input>');
    o.push('<input type="submit" style="display:none"/>');
    o.push('</form></li>');

    o.push('<li id="fbHighScore"/>');

    o.push('<li id="topHelp"><img src="/images/iconHelp.png" id="iconHelp" title="Home"/>');
    o.push('<div id="keys"></div>');
    o.push('</li>');

    o.push('<li id="fbLoginImage"/>');

    o.push('</ul>');
    var loginZone = $(o.join(''));
    loginZone.hide();
    $('body').append(loginZone);

    var $keys = $('#keys');
    $('#iconHelp').hover(function() {
      $keys.show();
    }, function() {
      $keys.hide();
    });
    $('#keys').html(getHelps());
    $playerName = $('#playerName');

    $playerName.keyup(function() {
      Karma.set('playerName', $playerName.val());
    });

    loginZone.children().hide();


  }

  function createHelp(k, text) {
    return {
      'key': k,
      'text': text
    };
  }

  function getHelps() {
    var helps = [];
    helps.push(createHelp('&#8593;&nbsp;&#8595;', 'accelerate / go backward'));
    helps.push(createHelp('&#8592;&nbsp;&#8594;', 'turn left / right'));
    helps.push(createHelp('&#60;space&#62;', 'shoot'));
    helps.push(createHelp('L/P', 'zoom / unzoom'));
    helps.push(createHelp('B', 'break'));
    helps.push(createHelp('Mouse Click', 'drive'));

    var o = [];
    for (var i = 0; i < helps.length; i++) {
      var h = helps[i];
      o.push('<td class="help_keys">' + h.key + '</td><td class="help_keys_text">' + h.text + '</td>');
    }
    var html = '<table><tr>' + o.join('</tr><tr>') + '</tr></table>';
    return html;
  }
  TopBar.show = function() {
    $bar = $('#topBar');
    $bar.slideDown(function() {
      $bar.children().fadeIn();
    });
    setTimeout(function() {
      $bar.removeClass('init');
    }, 2500);
  };

  TopBar.setTopBar = setTopBar;

}());
;

function Engine2DCanvas(gameInstance, canvas, canvasID) {
  this.canvas = canvas;
  this.canvasID = canvasID;
  this.gameInstance = gameInstance;
  this.init();
  this.loaded();
  this.timer = new Date().getTime();
  this.frames = 0;
  this.debugDraw = false;
  this.carFlameTicks = {};
  return this;
}

Engine2DCanvas.prototype.initBackgroundCanvas = function() {
  this.backgroundCanvas = document.createElement('canvas');

  var wSize = this.camera.realWorldSize;

  var scale = 1;
  this.backgroundCanvas.width = wSize.w * scale;
  this.backgroundCanvas.height = wSize.h * scale;

  this.backgroundContext = this.backgroundCanvas.getContext('2d');
  this.backgroundContext.save();
  this.drawBackground(this.backgroundContext);
  this.drawOutsideWalls(this.backgroundContext);
  this.drawStaticItems(this.backgroundContext);
  this.backgroundContext.restore();
};

Engine2DCanvas.prototype.init = function() {
  this.ctx = this.canvas.getContext('2d');
  this.canvas.width = $('#' + this.canvasID).width();
  this.canvas.height = $('#' + this.canvasID).height();
  this.camera = new Camera(this.ctx, '#' + this.canvasID);
  this.camera.setWorldSize(this.gameInstance.world.size);
  this.loadCarsImages();
  this.explosionImage = new Image();
  this.explosionImage.src = '/sprites/explosion.png';
  this.rocketImage = new Image();
  this.rocketImage.src = '/sprites/rocket.png';
  this.gunFlameImage = new Image();
  this.gunFlameImage.src = '/sprites/gun_flame.png';
};

Engine2DCanvas.prototype.loadCarsImages = function() {
  this.carImages = {};
  for (var carName in this.gameInstance.carsImages) {
    var car = this.gameInstance.carsImages[carName];
    var i = new Image();
    i.src = car.path;
    this.carImages[car.name] = i;
  }
};

Engine2DCanvas.prototype.loaded = function() {
  $('#loadingtext').html('');
};

Engine2DCanvas.prototype.draw = function() {
  if (this.gameInstance.walls.length > 0) {
    this.camera.ctx.canvas.width = $('#' + this.canvasID).width();
    this.camera.ctx.canvas.height = $('#' + this.canvasID).height();
    var newCenter = this.gameInstance.mycar || this.oldCenter;
    this.camera.update(newCenter);
    if (newCenter && newCenter != this.oldCenter) {
      this.oldCenter = newCenter;
    }
    this.drawItems();
  }
};

function drawAxis(ctx, a) {
  ctx.strokeStyle = '#000000';
  ctx.beginPath();
  ctx.moveTo(-a.x * scale2, -a.y * scale2);
  // ctx.lineTo(coord.x, coord.y);
  ctx.lineTo(a.x * scale2, a.y * scale2);
  ctx.closePath();
  ctx.stroke();
}


function drawLine(ctx, p1, p2) {
  drawPoint(ctx, p2);
  ctx.save();
  ctx.strokeStyle = '#0000FF';
  ctx.fillStyle = '#0000FF';
  ctx.translate(p2.x, p2.y);
  ctx.rotate(c.r);
  var w = 5;
  ctx.fillRect(-w / 2, -w / 2, w, w);
  ctx.restore();
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  // ctx.moveTo(0, 0);
  ctx.lineTo(p2.x, p2.y);
  ctx.closePath();
  ctx.stroke();
}

Engine2DCanvas.prototype.drawBodies = function(ctx) {
  var c, i;

  if (this.debugDraw && this.gameInstance.bodies !== null) {
    for (i = 0; i < this.gameInstance.bodies.length; i++) {
      c = this.gameInstance.bodies[i];

      ctx.save();
      ctx.fillStyle = c.color;
      ctx.translate(c.x, c.y);
      ctx.beginPath();
      ctx.moveTo(c.ul.x, c.ul.y);
      ctx.lineTo(c.ur.x, c.ur.y);
      ctx.lineTo(c.br.x, c.br.y);
      ctx.lineTo(c.bl.x, c.bl.y);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.save();
      var textSize = ctx.measureText(c.playerName);
      var textPad = 25;
      ctx.translate(c.x, c.y);
      ctx.fillText(c.playerName, -textSize.width / 2, -textPad);
      ctx.restore();
    }



    for (i = 0; i < this.gameInstance.bodies.length; i++) {
      c = this.gameInstance.bodies[i];
      var scale = 32;
      var scale2 = scale * 6;

      ctx.save();
      ctx.translate(c.x, c.y);

      // drawPoint(ctx, c.ur)
      // drawPoint(ctx, c.ul)
      // drawPoint(ctx, c.br)
      // drawPoint(ctx, c.bl)
      var debug_collisions = false;
      if (debug_collisions) {
        if (!_.isUndefined(c.collision)) {
          drawAxis(ctx, c.collision.a1);
          drawAxis(ctx, c.collision.a2);
          drawAxis(ctx, c.collision.a3);
          drawAxis(ctx, c.collision.a4);
          for (i = 1; i <= 4; ++i) {
            drawPoint(ctx, c.collision.axesMinMax[i].minA, '#000');
            drawPoint(ctx, c.collision.axesMinMax[i].maxA, '#F00');
            drawPoint(ctx, c.collision.axesMinMax[i].minB, '#0F0');
            drawPoint(ctx, c.collision.axesMinMax[i].maxB, '#00F');
          }
        }
      }
      ctx.restore();
    }
  }
};


Engine2DCanvas.prototype.drawLifeBar = function(ctx, c) {
  ctx.save();
  ctx.translate(-c.w / 2, -40);
  var maxLifeSize = c.w;
  ctx.fillStyle = '#0F0';
  ctx.fillRect(0, 0, maxLifeSize, 5);
  ctx.fillStyle = '#F00';
  var ratioSize = maxLifeSize * (c.life / c.maxLife);
  ctx.fillRect(ratioSize, 0, maxLifeSize - ratioSize, 5);
  ctx.restore();
};

var maxFlameTick = 12;

Engine2DCanvas.prototype.drawSingleGunFlame = function(ctx, car, angle, distance) {
  var ratio = 1.5;
  ctx.rotate(angle);
  var w = car.w / 2;
  var h = car.h / 2;
  if (car.flame > maxFlameTick / 2) {
    ctx.drawImage(this.gunFlameImage, 0, 0, 135, 125, distance, -h / 2, w, h);
  } else {
    ctx.drawImage(this.gunFlameImage, 0, 0, 135, 125, distance, -h / 2 / ratio, w / ratio, h / ratio);
  }
  ctx.rotate(-angle);
};

Engine2DCanvas.prototype.drawGunFlame = function(ctx, car) {
  if (KLib.isUndefined(this.carFlameTicks[car.id])) {
    this.carFlameTicks[car.id] = 0;
  }
  car.flame = this.carFlameTicks[car.id];
  switch (car.shootingWithWeapon) {
    case '90 angle machine gun':
      this.drawSingleGunFlame(ctx, car, 0, car.w / 2);
      this.drawSingleGunFlame(ctx, car, Math.PI / 2, car.w / 4);
      this.drawSingleGunFlame(ctx, car, -Math.PI / 2, car.w / 4);
      break;
    case 'super machine gun':
      this.drawSingleGunFlame(ctx, car, 0, car.w / 2);
      this.drawSingleGunFlame(ctx, car, Math.PI / 4, car.w / 4);
      this.drawSingleGunFlame(ctx, car, -Math.PI / 4, car.w / 4);
      break;
    case 'machine gun':
      this.drawSingleGunFlame(ctx, car, 0, car.w / 2);
      break;
    default:
      this.drawSingleGunFlame(ctx, car, 0, car.w / 2);
      break;
  }
  this.carFlameTicks[car.id] = (this.carFlameTicks[car.id] + 1) % maxFlameTick;
};

Engine2DCanvas.prototype.drawCars = function(ctx) {
  if (this.gameInstance.cars !== null) {
    for (var i = 0; i < this.gameInstance.cars.length; i++) {
      var c = this.gameInstance.cars[i];
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.r);
      var carImage = this.gameInstance.carsImages[c.carImageName];
      ctx.drawImage(this.carImages[carImage.name], 0, 0, carImage.w, carImage.h, -c.w / 2, -c.h / 2, c.w, c.h);

      if (c.shootingWithWeapon) {
        this.drawGunFlame(ctx, c);
      }

      // if(this.debugDraw) {
      //   ctx.fillStyle = '#FFFFFF';
      //   ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
      // }
      ctx.restore();


      var textSize = ctx.measureText(c.playerName);
      var textPad = 25;
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.font = '10px Trebuchet MS';
      ctx.fillStyle = 'white';
      ctx.fillText(c.playerName, -textSize.width / 2, -textPad);
      this.drawLifeBar(ctx, c);
      ctx.restore();

      this.drawBullet(c, ctx);
    }
  }
};

var explosionWidth = 56;
var explosionHeight = 51;

Engine2DCanvas.prototype.drawExplosions = function(ctx) {
  if (this.gameInstance.explosions !== null) {
    ctx.fillStyle = '#FFFFFF';
    for (var i in this.gameInstance.explosions) {
      var c = this.gameInstance.explosions[i];
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.r);
      var h = explosionHeight;
      var w = explosionWidth;
      ctx.globalAlpha = c.alpha;
      ctx.drawImage(this.explosionImage, 0, 0, w, h, -h / 2, -h / 2, w, h);
      ctx.restore();
    }
  }
};


Engine2DCanvas.prototype.drawProjectiles = function(ctx) {
  if (this.gameInstance.projectiles !== null) {
    for (var i = 0; i < this.gameInstance.projectiles.length; i++) {
      var c = this.gameInstance.projectiles[i];
      switch (c.name) {
        case 'rocket launcher':
          this.drawRocket(c, ctx);
          break;
        default:
          this.drawBullet(c, ctx);
          break;
      }
    }
  }
};

Engine2DCanvas.prototype.drawCollisionPoints = function() {
  if (!this.gameInstance.collisionPoints) {
    return;
  }
  var ctx = this.ctx;
  for (var i in this.gameInstance.collisionPoints) {
    var a = this.gameInstance.collisionPoints[i];
    drawPoint(ctx, a, '#F00');
  }
};

Engine2DCanvas.prototype.drawBullet = function(bullet, ctx) {
  ctx.fillStyle = '#0F0';
  var c = bullet;
  ctx.save();
  ctx.beginPath();
  var a = c;
  ctx.translate(a.x, a.y);

  // var len = 500;
  // ctx.lineTo(a.x + Math.cos(a.r) * len, a.y + Math.sin(a.r) * len);
  // ctx.lineTo(a.p3.x, a.p3.y);

  ctx.moveTo(0, 0);
  ctx.rotate(a.r);
  // ctx.moveTo(-320, 0);
  ctx.lineTo(320, 0);
  ctx.closePath();
  // ctx.stroke();

  ctx.restore();
};

Engine2DCanvas.prototype.drawRocket = function(rocket, ctx) {

  ctx.fillStyle = '#FFFFFF';
  var c = rocket;
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(c.r);
  ctx.drawImage(this.rocketImage, -c.w / 2, -c.h / 2, 40, 16);
  // ctx.drawImage(this.rocketImage, 0, 0, c.w, c.h);
  ctx.restore();

};

Engine2DCanvas.prototype.drawOutsideWalls = function(ctx) {
  var wThickness = 50;
  var s = this.camera.realWorldSize;
  if (this.debugDraw) {
    ctx.fillStyle = '#00FF00';
  } else {
    ctx.fillStyle = this.gameInstance.itemsInMap.outsideWall.pattern;
  }

  // bot
  ctx.fillRect(-wThickness, s.h, s.w + 2 * wThickness, wThickness);
  // top
  ctx.fillRect(-wThickness, -wThickness, s.w + 2 * wThickness, wThickness);
  // left
  ctx.fillRect(-wThickness, 0, wThickness, s.h);
  // right
  ctx.fillRect(s.w, 0, wThickness, s.h);
};

Engine2DCanvas.prototype.drawStaticItems = function(ctx) {
  var that = this;
  if (that.gameInstance.walls !== null) {
    _.each(that.gameInstance.walls, function(c) {
      var staticItem = that.gameInstance.itemsInMap[c.name];
      if (!KLib.isUndefined(staticItem) && !KLib.isUndefined(staticItem.pattern)) {
        if (staticItem.pattern === null) {
          ctx.drawImage(staticItem.img, c.x - c.w / 2, c.y - c.h / 2, c.w, c.h);
        } else {
          ctx.fillStyle = staticItem.pattern;
          ctx.fillRect(c.x - c.w / 2, c.y - c.h / 2, c.w, c.h);
        }
      }
    });
  }
};

Engine2DCanvas.prototype.drawBackground = function(ctx) {
  if (KLib.isUndefined(this.gameInstance.backgroundPattern)) {
    return;
  }
  var cs = this.camera.getCanvasSize();
  ctx.fillStyle = this.gameInstance.backgroundPattern;
  ctx.fillRect(0, 0, this.camera.realWorldSize.w, this.camera.realWorldSize.h);
};

Engine2DCanvas.prototype.drawItems = function() {
  this.drawBackground(this.ctx);
  this.drawBodies(this.ctx);
  this.drawOutsideWalls(this.ctx);
  this.drawStaticItems(this.ctx);
  this.drawCars(this.ctx);
  this.drawExplosions(this.ctx);
  // this.drawBullets(this.ctx);
  // this.drawRockets(this.ctx);
  this.drawProjectiles(this.ctx);
  this.drawCollisionPoints();
};

Engine2DCanvas.prototype.tick = function() {
  requestAnimFrame(this.tick.bind(this));
  this.gameInstance.drawEngine.draw();

  this.frames++;
  var now = new Date().getTime();
  if (now - this.timer > 1000) {
    this.timer = now;
    $('#fps').html('fps: ' + this.frames);
    this.frames = 0;
  }

};

function drawPoint(ctx, p, color) {
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = color || '#FF0000';
  ctx.arc(p.x, p.y, 10, 0, 2 * Math.PI, false);
  ctx.fill();
  ctx.closePath();
  ctx.fillStyle = color || '#00FF00';
  if (p.name) {
    ctx.fillText(p.name, p.x, p.y);
  }
  ctx.restore();
}
;

function Camera(ctx, _canvasSelector){
  this.ctx = ctx;
  this.translate = {"x" : 0, "y" : 0};
  this.center = {"x" : 0, "y" : 0};
  this.scale = 1.2;
  this.realWorldSize = {"w" : 0, "h" : 0};
  this.canvasSelector = _canvasSelector;

}

Camera.prototype.setWorldSize = function(realWorldSize) {
  this.realWorldSize = realWorldSize;
  var canvasSize = this.getCanvasSize();
  this.scaledSized = {w : canvasSize.w * this.scale, h : canvasSize.h * this.scale};
  this.scaleLimits = {min : 0.1, max : 5};
};

Camera.prototype.updateScale = function (){
  var screenRatio = this.getScreenRatio();
};

Camera.prototype.getCanvasSize = function() {
  return {w : this.ctx.canvas.width, h : this.ctx.canvas.height};
};

Camera.prototype.resizeCanvas = function(newSize){
  if (this.ctx !== null){
    this.ctx.canvas.width = newSize.w;
    this.ctx.canvas.height = newSize.h;
    $(this.canvasSelector).width(newSize.w);
    $(this.canvasSelector).height(newSize.h);
  }
};

Camera.prototype.getScreenRatio = function(){
  var canvasSize = this.getCanvasSize();
  var ratioX = canvasSize.w / this.realWorldSize.w;
  var ratioY = canvasSize.h / this.realWorldSize.h;
  if (ratioX < ratioY) return ratioX;
  return ratioY;
};

Camera.prototype.drawDebug = function() {
  var canvasSize = this.getCanvasSize();
  var cameraDebug = [];
  cameraDebug.push('<ul>');
  cameraDebug.push('<li>', 'Canvas Size : ', canvasSize.w, ', ', canvasSize.h, '</li>');
  cameraDebug.push('<li>', 'Translate X : ', this.translate.x, '</li>');
  cameraDebug.push('<li>', 'Translate Y : ', this.translate.y, '</li>');
  cameraDebug.push('<li>', 'Scale : ', this.scale, '</li>');
  cameraDebug.push('<li>', 'Scaled Size : ', this.scaledSized.w, ', ', this.scaledSized.h, '</li>');
  cameraDebug.push('<li>', 'myCar Pos : ', this.center.x, ', ', this.center.y, ', r°:', this.center.r,'</li>');
  cameraDebug.push('<li>', 'Orientation : ',  window.orientation ,'</li>');
  if (window.orientation !== null){
  }
  cameraDebug.push('</ul>');
  $('#camera-debug').html(cameraDebug.join(''));
};

Camera.prototype.update = function(center) {
  //if (center == null) return;
  if (typeof center !== "undefined"){
    this.center = center;
  }
  this.updateScale();
  var canvasSize = this.getCanvasSize();
  this.scaledSized = {w : canvasSize.w / (this.scale), h : canvasSize.h / (this.scale)};
  this.translate.x = this.scaledSized.w / 2 - this.center.x;
  this.translate.y = this.scaledSized.h / 2 - this.center.y;

  // scale the canvas & make the horizontal mirror
  this.ctx.scale(this.scale, this.scale);
  // translate to center the car
  this.ctx.translate(this.translate.x, this.translate.y);
  //this.drawDebug();
};
;

/**
* Provides requestAnimationFrame in a cross browser way.
*/
window.requestAnimFrame = (function() {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback, element) {
      window.setTimeout(callback, 1000/60);
    }
  );
})();

function DrawEngineFactory(gameInstance, canvasID, defaultDrawEngineType){
  var canvas = document.getElementById(canvasID);
  var drawEngineType = defaultDrawEngineType;
  var gl;

  var factory = function(gameInstance, drawEngineType, canvasID, canvas, gl) {
    switch(drawEngineType){
      case 'CANVAS' :
        return new Engine2DCanvas(gameInstance, canvas, canvasID);
    }
  };

  var getWebGL = function(canvas) {
    try {
      gl = canvas.getContext("experimental-webgl", { antialias: false});
      canvas.width = $('#game-canvas').width() - 10;
      canvas.height = $('#game-canvas').height();
      gl.viewportWidth = canvas.width;
      gl.viewportHeight = canvas.height;
      return gl;
    }
    catch (e) {
      return null;
    }
  };

  drawEngineType = "CANVAS";

  return factory(gameInstance, drawEngineType, canvasID, canvas, gl);
}

;

// function degToRad(degrees) {
//   return degrees * Math.PI / 180;
// }

// function EngineWebGL(gameInstance, canvas, canvasID, gl) {
//   this.canvas = canvas;
//   this.canvasID = canvasID;
//   this.gameInstance = gameInstance;
//   this.gl = gl;
//   this.tabItems = ['road', 'grass', 'car'];
//   this.tabTextures = {
//     grass: null,
//     road: null,
//     car: null
//   };
//   this.tabTexturesSources = {
//     grass: { file: "../sprites/grass.gif", size: 128 },
//     road: { file: "../sprites/road.jpg", size: 128 },
//     car: { file: "../sprites/car.png", size: 128 }
//   };
//   this.worldVertexPositionBuffer = {
//     road: null,
//     grass: null,
//     car: null
//   };
//   this.worldVertexTextureCoordBuffer = {
//     road: null,
//     grass: null,
//     car: null
//   };
//   this.mvMatrix = mat4.create();
//   this.mvMatrixStack = [];
//   this.pMatrix = mat4.create();
//   this.pitch = -90;
//   this.init();
//   this.loaded();
//   return this;
// }

// EngineWebGL.prototype.init = function() {
//   this.initShaders();
//   this.initTexture();
//   this.loadWorld();
//   this.loaded();
//   this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
//   this.gl.enable(this.gl.DEPTH_TEST);
//   this.camera = new Camera(null, this.canvasID);
// };

// EngineWebGL.prototype.initShaders = function() {
//   var fragmentShader = this.getShader("shader-fs");
//   var vertexShader = this.getShader("shader-vs");
//   this.shaderProgram = this.gl.createProgram();
//   this.gl.attachShader(this.shaderProgram, vertexShader);
//   this.gl.attachShader(this.shaderProgram, fragmentShader);
//   this.gl.linkProgram(this.shaderProgram);
//   if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
//     alert("Could not initialise shaders");
//   }
//   this.gl.useProgram(this.shaderProgram);
//   this.shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
//   this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);
//   this.shaderProgram.textureCoordAttribute = this.gl.getAttribLocation(this.shaderProgram, "aTextureCoord");
//   this.gl.enableVertexAttribArray(this.shaderProgram.textureCoordAttribute);
//   this.shaderProgram.pMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uPMatrix");
//   this.shaderProgram.mvMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uMVMatrix");
//   this.shaderProgram.samplerUniform = this.gl.getUniformLocation(this.shaderProgram, "uSampler");
// }

// EngineWebGL.prototype.getShader = function(id) {
//   var shaderScript = document.getElementById(id);
//   if (!shaderScript) {
//     return null;
//   }
//   var str = "";
//   var k = shaderScript.firstChild;
//   var shader;
//   while (k) {
//     if (k.nodeType == 3) {
//       str += k.textContent;
//     }
//     k = k.nextSibling;
//   }
//   if (shaderScript.type == "x-shader/x-fragment") {
//     shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
//   } else if (shaderScript.type == "x-shader/x-vertex") {
//     shader = this.gl.createShader(this.gl.VERTEX_SHADER);
//   } else {
//     return null;
//   }
//   this.gl.shaderSource(shader, str);
//   this.gl.compileShader(shader);
//   if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
//     alert(this.gl.getShaderInfoLog(shader));
//     return null;
//   }
//   return shader;
// }

// EngineWebGL.prototype.initTexture = function() {
//   for (var i in this.tabItems) {
//     var item = this.tabItems[i];
//     this.tabTextures[item] = this.gl.createTexture();
//     this.tabTextures[item].image = new Image();
//     this.tabTextures[item].image.src = this.tabTexturesSources[item].file;
//   }
//   this.tabTextures.grass.image.onload = function () {
//     this.handleLoadedTexture(this.tabTextures.grass)
//   }.bind(this);
//   this.tabTextures.road.image.onload = function () {
//     this.handleLoadedTexture(this.tabTextures.road)
//   }.bind(this);
//   this.tabTextures.car.image.onload = function () {
//     this.handleLoadedTexture(this.tabTextures.car)
//   }.bind(this);
// }

// EngineWebGL.prototype.handleLoadedTexture = function(texture) {
//   this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
//   this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
//   this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, texture.image);
//   this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
//   this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
//   this.gl.bindTexture(this.gl.TEXTURE_2D, null);
// }

// EngineWebGL.prototype.loadWorld = function() {
//   var car_width = 16.75 * this.tabTexturesSources.car.size / 65;

//   this.handleLoadedWorld({
//     grass: [
//     [-0.5,  0.0, -0.5,  0.0, 1.0],
//     [-0.5,  0.0,  0.5,  0.0, 0.0],
//     [0.5,  0.0,  0.5, 1.0, 0.0],
//     [-0.5,  0.0, -0.5,  0.0, 1.0],
//     [0.5,  0.0, -0.5, 1.0, 1.0],
//     [0.5,  0.0,  0.5, 1.0, 0.0]
//     ],

//     road: [
//     [-0.5,  0.0, -0.5,  0.0, 1.0],
//     [-0.5,  0.0,  0.5,  0.0, 0.0],
//     [0.5,  0.0,  0.5, 1.0, 0.0],
//     [-0.5,  0.0, -0.5,  0.0, 1.0],
//     [0.5,  0.0, -0.5, 1.0, 1.0],
//     [0.5,  0.0,  0.5, 1.0, 0.0]
//     ],

//     car: [
//     [-car_width/2,  0.0, -car_width/2,  0.0, 1.0],
//     [-car_width/2,  0.0,  car_width/2,  0.0, 0.0],
//     [car_width/2,  0.0,  car_width/2, 1.0, 0.0],
//     [-car_width/2,  0.0, -car_width/2,  0.0, 1.0],
//     [car_width/2,  0.0, -car_width/2, 1.0, 1.0],
//     [car_width/2,  0.0,  car_width/2, 1.0, 0.0]
//     ]
//   });
// }

// EngineWebGL.prototype.loadWalls = function(data) {
//   var vertexPositions = [];
//   var vertexTextureCoords = [];
//   var vertexCount = [];

//   this.walls = this.gameInstance.walls;
//   var walls = this.walls;

//    for (var i in walls) {
//      vertexPositions[i] =
//      [
//        -walls[i].w / 2    , 0.0       , -(-walls[i].h / 2),
//        -walls[i].w / 2    , 0.0       , -(+walls[i].h / 2),
//        +walls[i].w / 2    , 0.0       , -(+walls[i].h / 2),
//        -walls[i].w / 2    , 0.0       , -(-walls[i].h / 2),
//        +walls[i].w / 2    , 0.0       , -(-walls[i].h / 2),
//        +walls[i].w / 2    , 0.0       , -(+walls[i].h / 2),
//      ];

//      vertexTextureCoords[i] =
//      [
//        0.0                , walls[i].h / 100,
//        0.0                , 0.0,
//        walls[i].w / 100   , 0.0,
//        0.0                , walls[i].h / 100,
//        walls[i].w / 100   , walls[i].h / 100,
//        walls[i].w / 100   , 0.0,
//      ];

//      vertexCount[i] = 6;
//    }

//    this.wallVertexPositionBuffer = [];
//    this.wallVertexTextureCoordBuffer = [];
//    for (var i in walls) {
//      this.wallVertexPositionBuffer[i] = this.gl.createBuffer();
//      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.wallVertexPositionBuffer[i]);
//      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertexPositions[i]), this.gl.STATIC_DRAW);
//      this.wallVertexPositionBuffer[i].itemSize = 3;
//      this.wallVertexPositionBuffer[i].numItems = vertexCount[i];
//      this.wallVertexTextureCoordBuffer[i] = this.gl.createBuffer();
//      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.wallVertexTextureCoordBuffer[i]);
//      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertexTextureCoords[i]), this.gl.STATIC_DRAW);
//      this.wallVertexTextureCoordBuffer[i].itemSize = 2;
//      this.wallVertexTextureCoordBuffer[i].numItems = vertexCount[i];
//    }
// }

// EngineWebGL.prototype.handleLoadedWorld = function(data) {
//   this.loadWalls(data);
//   var vertexCount = {
//     road: null,
//     grass: null,
//     car: null
//   };
//   var vertexPositions = {
//     road: [],
//     grass: [],
//     car: []
//   };
//   var vertexTextureCoords = {
//     road: [],
//     grass: [],
//     car: []
//   };
//   for (var item in data) {
//     for (var i in data[item]) {
//       var vals = data[item][i];
//       // It is a line describing a vertex; get X, Y and Z first
//       vertexPositions[item].push(parseFloat(vals[0]));
//       vertexPositions[item].push(parseFloat(vals[1]));
//       vertexPositions[item].push(parseFloat(vals[2]));
//       // And then the texture coords
//       vertexTextureCoords[item].push(parseFloat(vals[3]));
//       vertexTextureCoords[item].push(parseFloat(vals[4]));
//       vertexCount[item] += 1;
//     }
//   }
//   for (var i in this.tabItems) {
//     var item = this.tabItems[i];
//     this.worldVertexPositionBuffer[item] = this.gl.createBuffer();
//     this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.worldVertexPositionBuffer[item]);
//     this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertexPositions[item]), this.gl.STATIC_DRAW);
//     this.worldVertexPositionBuffer[item].itemSize = 3;
//     this.worldVertexPositionBuffer[item].numItems = vertexCount[item];
//     this.worldVertexTextureCoordBuffer[item] = this.gl.createBuffer();
//     this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.worldVertexTextureCoordBuffer[item]);
//     this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertexTextureCoords[item]), this.gl.STATIC_DRAW);
//     this.worldVertexTextureCoordBuffer[item].itemSize = 2;
//     this.worldVertexTextureCoordBuffer[item].numItems = vertexCount[item];
//   }
// }

// EngineWebGL.prototype.tick = function() {
//   requestAnimFrame(this.tick.bind(this));
//   this.drawScene();
// }

// EngineWebGL.prototype.loaded = function() {
//   $('#loadingtext').html('');
// };

// EngineWebGL.prototype.mvPushMatrix = function() {
//   var copy = mat4.create();
//   mat4.set(this.mvMatrix, copy);
//   this.mvMatrixStack.push(copy);
// }

// EngineWebGL.prototype.mvPopMatrix = function() {
//   if (this.mvMatrixStack.length == 0) {
//     throw "Invalid popMatrix!";
//   }
//   this.mvMatrix = this.mvMatrixStack.pop();
// }

// EngineWebGL.prototype.setMatrixUniforms = function() {
//   this.gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, this.pMatrix);
//   this.gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix);
// }

// EngineWebGL.prototype.drawScene = function() {
//   var cameraHeight = this.gameInstance.drawEngine.camera.scale * 600;
//   if (this.gameInstance.mycar == undefined) {
//     this.gameInstance.mycar = { x: 0, y: 0 };
//   }
//   this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
//   this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
//   if (this.worldVertexTextureCoordBuffer.road == null || this.worldVertexPositionBuffer.road == null ||  this.worldVertexTextureCoordBuffer.grass == null || this.worldVertexPositionBuffer.grass == null) {
//     return;
//   }
//   mat4.perspective(45, this.gl.viewportWidth / this.gl.viewportHeight, 0.1, 1000.0, this.pMatrix);
//   mat4.identity(this.mvMatrix);

//    this.drawCars(cameraHeight)
//    this.drawMap(cameraHeight)
// }

// EngineWebGL.prototype.drawMap = function(cameraHeight) {
// //  this.drawGround(cameraHeight)
//   this.drawWalls(cameraHeight)
// }

// EngineWebGL.prototype.drawWalls = function(cameraHeight) {
//   for (var i in this.walls) {
//     this.mvPushMatrix();
//     mat4.rotate(this.mvMatrix, degToRad(-this.pitch), [1, 0, 0]);
//     mat4.translate(this.mvMatrix, [0, -cameraHeight, 0]);
//     mat4.translate(this.mvMatrix, [-this.gameInstance.mycar.x, 0, this.gameInstance.mycar.y]);
//     mat4.translate(this.mvMatrix, [this.walls[i].x, 0, -this.walls[i].y]);
//     this.gl.activeTexture(this.gl.TEXTURE0);
//     this.gl.bindTexture(this.gl.TEXTURE_2D, this.tabTextures.road);
//     this.gl.uniform1i(this.shaderProgram.samplerUniform, 0);
//     this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
//     this.gl.enable(this.gl.BLEND);
//     this.gl.disable(this.gl.DEPTH_TEST);
//     this.gl.uniform1f(this.shaderProgram.alphaUniform, 0);
//     this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.wallVertexTextureCoordBuffer[i]);
//     this.gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, this.wallVertexTextureCoordBuffer[i].itemSize, this.gl.FLOAT, false, 0, 0);
//     this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.wallVertexPositionBuffer[i]);
//     this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.wallVertexPositionBuffer[i].itemSize, this.gl.FLOAT, false, 0, 0);
//     this.setMatrixUniforms();
//     this.gl.drawArrays(this.gl.TRIANGLES, 0, this.wallVertexPositionBuffer[i].numItems);
//     this.mvPopMatrix();
//   }
// }

// EngineWebGL.prototype.drawGround = function(cameraHeight) {
//   for (var i in this.tabItems) {
//     var item = this.tabItems[i];
//     if (item == 'car') {
//       continue;
//     }
//     this.mvPushMatrix();
//     mat4.rotate(this.mvMatrix, degToRad(-this.pitch), [1, 0, 0]);
//     mat4.translate(this.mvMatrix, [0, -cameraHeight, 0]);
//     mat4.translate(this.mvMatrix, [-this.gameInstance.mycar.x, 0, this.gameInstance.mycar.y]);
//     this.gl.activeTexture(this.gl.TEXTURE0);
//     this.gl.bindTexture(this.gl.TEXTURE_2D, this.tabTextures[item]);
//     this.gl.uniform1i(this.shaderProgram.samplerUniform, 0);
//     this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
//     this.gl.enable(this.gl.BLEND);
//     this.gl.disable(this.gl.DEPTH_TEST);
//     this.gl.uniform1f(this.shaderProgram.alphaUniform, 0);
//     this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.worldVertexTextureCoordBuffer[item]);
//     this.gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, this.worldVertexTextureCoordBuffer[item].itemSize, this.gl.FLOAT, false, 0, 0);
//     this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.worldVertexPositionBuffer[item]);
//     this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.worldVertexPositionBuffer[item].itemSize, this.gl.FLOAT, false, 0, 0);
//     this.setMatrixUniforms();
//     this.gl.drawArrays(this.gl.TRIANGLES, 0, this.worldVertexPositionBuffer[item].numItems);
//     this.mvPopMatrix();
//   }
// }

// EngineWebGL.prototype.drawCars = function(cameraHeight) {
//   _.each(this.gameInstance.cars, function(car) {
//     var item = 'car';
//     this.mvPushMatrix();
//     mat4.rotate(this.mvMatrix, degToRad(-this.pitch), [1, 0, 0]);
//     mat4.translate(this.mvMatrix, [0, -cameraHeight, 0]);
//     mat4.translate(this.mvMatrix, [-this.gameInstance.mycar.x    , 0  , this.gameInstance.mycar.y]);
//     mat4.translate(this.mvMatrix, [+car.x, 0  , -car.y]);
//     mat4.rotate(this.mvMatrix, car.r, [0, 1, 0]);
//     this.gl.activeTexture(this.gl.TEXTURE0);
//     this.gl.bindTexture(this.gl.TEXTURE_2D, this.tabTextures[item]);
//     this.gl.uniform1i(this.shaderProgram.samplerUniform, 0);
//     this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
//     this.gl.enable(this.gl.BLEND);
//     this.gl.disable(this.gl.DEPTH_TEST);
//     this.gl.uniform1f(this.shaderProgram.alphaUniform, 0);
//     this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.worldVertexTextureCoordBuffer[item]);
//     this.gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, this.worldVertexTextureCoordBuffer[item].itemSize, this.gl.FLOAT, false, 0, 0);
//     this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.worldVertexPositionBuffer[item]);
//     this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.worldVertexPositionBuffer[item].itemSize, this.gl.FLOAT, false, 0, 0);
//     this.setMatrixUniforms();
//     this.gl.drawArrays(this.gl.TRIANGLES, 0, this.worldVertexPositionBuffer[item].numItems);
//     this.mvPopMatrix();
//   }.bind(this))
// }

;

var kFB = {};

(function() {

  kFB.host = function(){
    var host = window.location.hostname + ':' + window.location.port;
    return host;
  }();

  kFB.conf = function() {
    var dev = {
      appID: '156724717828757',
      appName: 'karmaracer_dev'
    };

    var prod = {
      appID: '512708015460560',
      appName: 'karmaracer'
    };

    if (kFB.host.indexOf('localhost') !== -1) {
      return dev;
    }
    return prod;

  }();



  function getLoginStatus() {
    FB.getLoginStatus(function(response) {
      if (response.status === 'connected') {
        // connected
        afterLogin(response);
      } else if (response.status === 'not_authorized') {
        // not_authorized
        login();
      } else {
        // not_logged_in
        login();
      }
    });
  }

  function loginIfAuthorized() {
    FB.getLoginStatus(function(response) {
      if (response.status === 'not_logged_in') {
        login();
      }
      if (response.status === 'connected') {
        afterLogin();
      }
    });
  }

  function getScore(user) {
    try {
      FB.api("/" + user.id + "/scores/" + kFB.conf.appName, function(response) {
        if (!response || response.error) {
          console.error(response);
        } else {
          var score = 0;
          if (response.data.length > 0) {
            score = response.data[0].score;
          }
          $('#fbHighScore').html('<div title="High Score">High Score : ' + score + '</div>');
          TopBar.show();
        }
      });
    } catch (err) {
      console.error(err);

    }
  }



  function afterLogin() {
    updateName();
  }


  function initFB() {
    FB.Event.subscribe('auth.login', function(response) {
      afterLogin();
    });
    loginIfAuthorized();
    $('#fb-login').on('click', function() {
      getLoginStatus();
      $(this).off('click');
    });

  }


  function login() {
    FB.login(function(response) {
      if (response.authResponse) {
        // connected
        afterLogin();
      } else {
        // cancelled
      }
    }, {
      scope: 'publish_actions'
    });
  }

  function setup() {
    window.fbAsyncInit = function() {
      // publish_actions
      var channelFile = 'http://' + kFB.host + '/channel.html';
      var options = {
        appId: kFB.conf.appID, // App ID
        channelUrl: channelFile, // Channel File
        status: true, // check login status
        cookie: true, // enable cookies to allow the server to access the session
        xfbml: true // parse XFBML
      };
      FB.init(options);
      // Additional init code here
      initFB();

    };

    // Load the SDK Asynchronously
    (function(d) {
      var js, id = 'facebook-jssdk',
        ref = d.getElementsByTagName('script')[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement('script');
      js.id = id;
      js.async = true;
      js.src = "//connect.facebook.net/en_US/all.js";
      ref.parentNode.insertBefore(js, ref);
    }(document));
  }

  function setProfileImage(container, callback) {
    FB.api("/me/picture?width=180&height=180", function(response) {
      container.html('<img class="fb-picture" src="' + response.data.url + '">');
      return callback(null, response);
    });
  }

  function updateName() {
    FB.api('/me', function(user) {
      setProfileImage($('#fbLoginImage'), function() {});
      var exists = Karma.exists('playerName');
      var savedName = Karma.get('playerName');
      if (!exists || savedName === '') {
        Karma.set('playerName', user.name);
        $('#playerName').val(user.name);
      } else {
        $('#playerName').val(savedName);
      }
      getScore(user);
    });
  }

  kFB.setup = setup;
  kFB.getLoginStatus = getLoginStatus;
  kFB.afterLogin = afterLogin;

  kFB.setup();


}());
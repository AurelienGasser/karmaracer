/* public/src/common/startup.js */
var Karma = Karma || {};
var KLib = KLib || {};
/* public/src/common/KLib.js */
(function() {
  'use strict';

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

}());

/* public/src/common/LocalStorage.js */
(function() {
"use strict";

  var KLocalStorage = function() {
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
      'exists': exists
    };
  };

  Karma.LocalStorage = new KLocalStorage();


}());
/* public/src/common/chat/chat.js */
(function() {
  "use strict";

  var Chat = {};


  var j = {
    input: $('#chat_input'),
    messages: $('#chat_msgs'),
    label: $('#chat_input_label'),
    input_wrapper: $('#chat_input_wrapper')
  };


  Chat.sendMsg = function() {
    if (j.input.val().trim() !== '') {
      var msg = (Karma.LocalStorage.get('playerName')) + ': ' + $('#chat_input').val();
      Karma.gameInstance.socketManager.emit('chat', msg);
    }
    j.input.val('');
    Chat.hideChat();
  };

  Chat.onChatMsgReceived = function(msg, key) {
    j.messages.append('<li id="' + key + '">' + msg + '</li>');
    setTimeout(function() {
      $('li#' + key).fadeOut(500, function() {
        $('li#' + key).remove();
      });
    }, 20000);
  };

  Chat.showChat = function() {
    j.label.html((Karma.LocalStorage.get('playerName')) + ' :');
    j.input_wrapper.show();
    j.input.focus();
    j.input_wrapper.addClass('enable');
  };

  Chat.hideChat = function() {
    j.input.blur();
    j.input_wrapper.hide();
    j.input_wrapper.removeClass('enable');
  };

  Chat.clearChatInputField = function() {
    j.input.val('');
  };

  Karma.Chat = Chat;

}());
/* public/src/common/drawEngine/2DCanvas.js */
(function() {
  "use strict";

  function Engine2DCanvas(canvas, canvasID, items, worldInfo, callback) {

    this.canvas = canvas;
    this.canvasID = canvasID;
    this.timer = new Date().getTime();
    this.frames = 0;
    this.debugDraw = false;
    this.carFlameTicks = {};

    this.items = items;
    this.worldInfo = worldInfo;

    this.setGScale(32);
    this.$canvas = $(canvas);

    this.init();
    this.loaded();
    this.loadImages(callback);
  }


  Engine2DCanvas.prototype.setGScale = function(gScaleValue) {
    this.gScaleValue = gScaleValue;
    this.gScaleDynamicsRequired = true;
    this.gScaleList(this.worldInfo.staticItems);
    this.gScale(this.worldInfo.size);
  };


  Engine2DCanvas.prototype.loadImages = function(callback) {

    var that = this;

    var imagesNumToLoad = Object.keys(this.worldInfo.itemsInMap).length + 1;
    var imageNumLoaded = 0;

    function imageLoaded() {
      if (imageNumLoaded === imagesNumToLoad - 1) {
        if (KLib.isFunction(callback)) {
          return callback();
        }
      }
      imageNumLoaded += 1;
    }

    that.createBGPattern(imageLoaded);
    // enhance items with patterns

    var onLoadImage = function() {
      if (this.patternType !== 'none') {
        var _pattern = that.ctx.createPattern(img, 'repeat');
        that.worldInfo.itemsInMap[this.name].pattern = _pattern;
      } else {
        that.worldInfo.itemsInMap[this.name].pattern = null;
        that.worldInfo.itemsInMap[this.name].img = img;
      }
      imageLoaded();
    };

    for (var itemName in this.worldInfo.itemsInMap) {
      var item = this.worldInfo.itemsInMap[itemName];

      var img = new Image();
      img.src = item.image.path;
      img.onload = onLoadImage.bind(item);
    }

  };

  Engine2DCanvas.prototype.createBGPattern = function(callback) {
    var that = this;
    // create background pattern
    var bgImage = new Image();
    bgImage.src = that.worldInfo.background.path;
    bgImage.onload = function() {
      var bgPattern = that.ctx.createPattern(this, 'repeat');
      that.backgroundPattern = bgPattern;
      return callback();
    };
  };

  Engine2DCanvas.prototype.gScaleList = function(list) {
    for (var i = list.length - 1; i >= 0; i--) {
      this.gScale(list[i]);
    }
  };

  Engine2DCanvas.prototype.gScaleIfRequired = function() {
    if (this.gScaleDynamicsRequired === true) {
      this.gScaleList(this.items.cars);
      this.gScale(this.items.mycar);
      this.gScaleDynamicsRequired = false;
    }
  };

  Engine2DCanvas.prototype.gScale = function(e) {
    if (e === null){
      return;
    }
    if (e.x) {
      e.x *= this.gScaleValue;
    }
    if (e.y) {
      e.y *= this.gScaleValue;
    }
    if (e.w) {
      e.w *= this.gScaleValue;
    }
    if (e.h) {
      e.h *= this.gScaleValue;
    }
  };

  Engine2DCanvas.prototype.init = function() {
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = $('#' + this.canvasID).width();
    this.canvas.height = $('#' + this.canvasID).height();
    this.camera = new Karma.Camera(this.ctx, '#' + this.canvasID);
    this.camera.setWorldSize(this.worldInfo.size);
    this.loadCars();
    this.explosionImage = new Image();
    this.explosionImage.src = '/sprites/explosion.png';
    this.rocketImage = new Image();
    this.rocketImage.src = '/sprites/rocket.png';
    this.gunFlameImage = new Image();
    this.gunFlameImage.src = '/sprites/gun_flame.png';
  };

  Engine2DCanvas.prototype.loaded = function() {
    $('#loadingtext').html('');
  };

  Engine2DCanvas.prototype.resize = function() {
    var size = {
      w: this.$canvas.width(),
      h: this.$canvas.height()
    };
    if (!KLib.isUndefined(this.canvasSize)) {
      size = this.canvasSize;
    }

    this.camera.ctx.canvas.width = size.w;
    this.camera.ctx.canvas.height = size.h;

  };

  Engine2DCanvas.prototype.draw = function() {
    if (this.worldInfo.staticItems.length > 0) {
      this.resize();

      var newCenter = this.oldCenter;
      if (this.items.mycar !== null) {
        newCenter = this.items.mycar;
        this.camera.update(newCenter);
      }
      if (newCenter && newCenter != this.oldCenter) {
        this.oldCenter = newCenter;
      }
      this.drawItems();
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


  var explosionWidth = 56;
  var explosionHeight = 51;

  Engine2DCanvas.prototype.drawExplosions = function(ctx) {
    if (this.items.explosions !== null) {
      ctx.fillStyle = '#FFFFFF';
      for (var i in this.items.explosions) {
        var c = this.items.explosions[i];
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
    if (this.items.projectiles !== null) {
      for (var i = 0; i < this.items.projectiles.length; i++) {
        var c = this.items.projectiles[i];
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
    var wThickness = this.gScaleValue;
    var s = this.camera.realWorldSize;
    if (this.debugDraw) {
      ctx.fillStyle = '#00FF00';
    } else {
      ctx.fillStyle = this.worldInfo.itemsInMap.outsideWall.pattern;
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
    if (that.worldInfo.staticItems !== null) {
      _.each(that.worldInfo.staticItems, function(c) {
        var staticItem = that.worldInfo.itemsInMap[c.name];
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
    if (KLib.isUndefined(this.backgroundPattern)) {
      return;
    }
    ctx.fillStyle = this.backgroundPattern;
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
    // this.drawCollisionPoints();
  };

  Engine2DCanvas.prototype.tick = function() {
    requestAnimFrame(this.tick.bind(this));
    this.gScaleIfRequired();
    this.draw();

    this.frames++;
    var now = new Date().getTime();
    if (now - this.timer > 1000) {
      this.timer = now;
      $('#fps').html('fps: ' + this.frames);
      this.frames = 0;
    }
  };

  Karma.Engine2DCanvas = Engine2DCanvas;
}());
/* public/src/common/drawEngine/camera.js */
(function() {
  "use strict";

  function Camera(ctx, _canvasSelector) {
    this.ctx = ctx;
    this.translate = {
      "x": 0,
      "y": 0
    };
    this.center = {
      "x": 0,
      "y": 0
    };
    this.scale = 1.2;
    this.realWorldSize = {
      "w": 0,
      "h": 0
    };
    this.canvasSelector = _canvasSelector;

  }

  Camera.prototype.setWorldSize = function(realWorldSize) {
    this.realWorldSize = realWorldSize;
    var canvasSize = this.getCanvasSize();
    this.scaledSized = {
      w: canvasSize.w * this.scale,
      h: canvasSize.h * this.scale
    };
    this.scaleLimits = {
      min: 0.1,
      max: 5
    };
  };

  Camera.prototype.updateScale = function() {
    // var screenRatio = this.getScreenRatio();
  };

  Camera.prototype.getCanvasSize = function() {
    return {
      w: this.ctx.canvas.width,
      h: this.ctx.canvas.height
    };
  };

  Camera.prototype.resizeCanvas = function(newSize) {
    if (this.ctx !== null) {
      this.ctx.canvas.width = newSize.w;
      this.ctx.canvas.height = newSize.h;
      $(this.canvasSelector).width(newSize.w);
      $(this.canvasSelector).height(newSize.h);
    }
  };

  Camera.prototype.getScreenRatio = function() {
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
    cameraDebug.push('<li>', 'myCar Pos : ', this.center.x, ', ', this.center.y, ', r°:', this.center.r, '</li>');
    cameraDebug.push('<li>', 'Orientation : ', window.orientation, '</li>');
    if (window.orientation !== null) {}
    cameraDebug.push('</ul>');
    $('#camera-debug').html(cameraDebug.join(''));
  };

  Camera.prototype.update = function(center) {
    //if (center == null) return;
    if (typeof center !== "undefined") {
      this.center = center;
    }
    this.updateScale();
    var canvasSize = this.getCanvasSize();
    this.scaledSized = {
      w: canvasSize.w / (this.scale),
      h: canvasSize.h / (this.scale)
    };
    this.translate.x = this.scaledSized.w / 2 - this.center.x;
    this.translate.y = this.scaledSized.h / 2 - this.center.y;

    // scale the canvas & make the horizontal mirror
    this.ctx.scale(this.scale, this.scale);
    // translate to center the car
    this.ctx.translate(this.translate.x, this.translate.y);
    //this.drawDebug();
  };

  Karma.Camera = Camera;

} ());
/* public/src/common/drawEngine/canvas/2DBodies.js */
(function(Engine2DCanvas) {
  "use strict";

  var scale2 = 32 * 6;

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


  function drawAxis(ctx, a) {
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(-a.x * scale2, -a.y * scale2);
    // ctx.lineTo(coord.x, coord.y);
    ctx.lineTo(a.x * scale2, a.y * scale2);
    ctx.closePath();
    ctx.stroke();
  }

  // 'drawLine' is defined but never used.
  // function drawLine(ctx, p1, p2, r) {
  //   drawPoint(ctx, p2);
  //   ctx.save();
  //   ctx.strokeStyle = '#0000FF';
  //   ctx.fillStyle = '#0000FF';
  //   ctx.translate(p2.x, p2.y);
  //   ctx.rotate(r);
  //   var w = 5;
  //   ctx.fillRect(-w / 2, -w / 2, w, w);
  //   ctx.restore();
  //   ctx.beginPath();
  //   ctx.moveTo(p1.x, p1.y);
  //   // ctx.moveTo(0, 0);
  //   ctx.lineTo(p2.x, p2.y);
  //   ctx.closePath();
  //   ctx.stroke();
  // }

  Engine2DCanvas.prototype.drawBodies = function(ctx) {
    var c, i;

    if (this.debugDraw && this.bodies !== null) {
      for (i = 0; i < this.bodies.length; i++) {
        c = this.bodies[i];

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



      for (i = 0; i < this.bodies.length; i++) {
        c = this.bodies[i];
        // var scale = 32;


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

  Engine2DCanvas.prototype.drawCollisionPoints = function() {
    if (!this.items.collisionPoints) {
      return;
    }
    var ctx = this.ctx;
    for (var i in this.items.collisionPoints) {
      var a = this.items.collisionPoints[i];
      drawPoint(ctx, a, '#F00');
    }
  };
}(Karma.Engine2DCanvas));
/* public/src/common/drawEngine/canvas/2DCars.js */
(function(Engine2DCanvas) {
  "use strict";

  Engine2DCanvas.prototype.loadCars = function() {
    var that = this;
    var getCar = function(name, imageName, w, h) {
      var car = {
        name: name,
        path: '/sprites/' + imageName,
        w: w,
        h: h
      };
      car.image = new Image();
      car.image.src = car.path;
      return car;
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


  Engine2DCanvas.prototype.drawCars = function(ctx) {
    if (this.items.cars !== null) {
      for (var i = 0; i < this.items.cars.length; i++) {
        var c = this.items.cars[i];
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.r);
        var carImage = this.carsImages[c.carImageName];
        ctx.drawImage(carImage.image, 0, 0, carImage.w, carImage.h, -c.w / 2, -c.h / 2, c.w, c.h);

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
}(Karma.Engine2DCanvas));
/* public/src/common/drawEngine/drawEngineFactory.js */
(function() {
"use strict";
  /**
   * Provides requestAnimationFrame in a cross browser way.
   */
  window.requestAnimFrame = (function() {
    return (
    window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
      window.setTimeout(callback, 1000 / 60);
    });
  })();

  function drawEngineFactory(canvasID, defaultDrawEngineType, items, worldInfo, callback) {
    var canvas = document.getElementById(canvasID);
    var drawEngineType = defaultDrawEngineType;
    var gl;

    var factory = function(drawEngineType, canvasID, canvas) {
      switch (drawEngineType) {
        case 'CANVAS':
          return new Karma.Engine2DCanvas(canvas, canvasID, items, worldInfo, callback);
      }
    };
    // 'getWebGL' is defined but never used.
    // var getWebGL = function(canvas) {
    //   try {
    //     gl = canvas.getContext("experimental-webgl", {
    //       antialias: false
    //     });
    //     canvas.width = $('#game-canvas').width() - 10;
    //     canvas.height = $('#game-canvas').height();
    //     gl.viewportWidth = canvas.width;
    //     gl.viewportHeight = canvas.height;
    //     return gl;
    //   } catch (e) {
    //     return null;
    //   }
    // };

    drawEngineType = "CANVAS";

    return factory(drawEngineType, canvasID, canvas);
  }

  Karma.getDrawEngine = drawEngineFactory;

}());
/* public/src/common/drawEngine/webgl.js */
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


/* public/src/common/fb/login.js */
// var kFB = {};

(function() {
  /*global FB*/
  "use strict";

  var kFB = {};

  kFB.host = function() {
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
          Karma.Log.error(response);
        } else {
          var score = 0;
          if (response.data.length > 0) {
            score = response.data[0].score;
          }
          $('#fbHighScore').html('<div title="High Score">High Score : ' + score + '</div>');
          Karma.TopBar.show();
        }
      });
    } catch (err) {
      Karma.Log.error(err);

    }
  }



  function afterLogin() {
    updateName();
  }


  function initFB() {
    FB.Event.subscribe('auth.login', function() {
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
      var exists = Karma.LocalStorage.exists('playerName');
      var savedName = Karma.LocalStorage.get('playerName');
      if (!exists || savedName === '') {
        Karma.LocalStorage.set('playerName', user.name);
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

  Karma.FB = kFB;


}());
/* public/src/common/log/Log.js */
(function() {
  /*global console*/
  "use strict";

  function error(msg) {
    if (console) {
      console.error(msg);
    }
  }

  function info(msg) {
    if (console) {
      console.info(msg);
    }
  }

  Karma.Log = {
    error: error,
    info : info
  };
}());
/* public/src/common/miniMap/MiniMap.js */
(function() {
  "use strict";

  var MiniMap = function($container, mapName, connection) {
    this.$container = $container;
    this.connection = connection;
    this.canvasID = 'minimap-' + mapName;
    this.$canvas = $('<canvas id="' + this.canvasID + '" class="miniMap"></canvas>');
    this.$container.append(this.$canvas);
    this.canvas = this.$canvas[0];

    this.getMap(mapName, function(err, map) {});
  };

  MiniMap.prototype.getMap = function(mapName, callback) {

    var that = this;
    var getMiniMap = function(err, worldInfo) {
      // that.$canvas.width(worldInfo.size.w);
      // that.$canvas.height(worldInfo.size.h);
      var items = {
        cars: [],
        mycar: null,
        projectiles: [],
        explosions: []
      };
      that.drawEngine = Karma.getDrawEngine(that.canvasID, 'CANVAS', items, worldInfo, function(drawEngine) {
        that.drawEngine.setGScale(1 / 6); // set to default size
        // that.drawEngine.setGScale(5);
        that.drawEngine.canvasSize = that.drawEngine.worldInfo.size;
        that.drawEngine.resize();
        that.drawEngine.tick();
      });



      if (KLib.isFunction(callback)) {
        return callback(null);
      }
    };

    this.connection.emit('getMiniMap', {
      'name': mapName
    }, getMiniMap);


  };

  Karma.MiniMap = MiniMap;



}());
/* public/src/common/topBar/topBar.js */
(function() {
  "use strict";

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
    var $playerName = $('#playerName');

    $playerName.keyup(function() {
      Karma.LocalStorage.set('playerName', $playerName.val());
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

  function show() {
    var $bar = $('#topBar');
    $bar.slideDown(function() {
      $bar.children().fadeIn();
    });
    setTimeout(function() {
      $bar.removeClass('init');
    }, 2500);
  }

  Karma.TopBar = {
    setTopBar: setTopBar,
    show: show
  };

}());
/* public/src/game/startup.js */
/*global Modernizr*/

(function() {
  "use strict";
  Modernizr.load([{
    complete: function() {
      Modernizr.load([{
        test: $("html.touch").length,
        yep: ['/dist/mobile.js', '/dist/mobile.css'],
        nope: ['src/mobile/no-touch.css'],
        complete: function() {
          Karma.gameInstance = new Karma.GameInstance();
          if (typeof(Karma.MobileTerminalHandler) === 'function') {
            var mobileHandler = new Karma.MobileTerminalHandler(Karma.gameInstance);
            mobileHandler.init();
          }
          new Karma.SteeringWheelController(Karma.gameInstance);
        }
      }]);
    }
  }]);
}());

/* public/src/game/SocketManager.js */
/*global prompt,io, G_mapName*/
(function(io) {
  "use strict";

  function SocketManager(gameInstance, onInitCallback) {
    var host = window.location.hostname;
    this.connection = io.connect(host);
    this.gameInstance = gameInstance;
    this.init_done = false;
    this.socketCounter = 0;
    this.timestamp = new Date().getTime();
    this.msg_id = 0;
    this.gameInstance.bodies = [];

    var that = this;

    $(window).on('beforeunload', function() {
      that.connection.emit('disconnect');
    });

    $(function() {
      $('#addBot').click(function() {
        that.connection.emit('add bot');
      });
      $('#removeBot').click(function() {
        that.connection.emit('remove bot');
      });
    });

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

    that.connection.on('connect', function() {
      if (!_.isUndefined(G_mapName)) {
        that.connection.emit('enter_map', G_mapName);
        announce('Shoot them all !', 'blue');
      } else {}

    });

    this.connection.on('init', function(worldInfo) {
      onInitCallback(null, worldInfo);
      if (!Karma.LocalStorage.get('playerName') || Karma.LocalStorage.get('playerName').length === 0) {
        Karma.LocalStorage.set('playerName', prompt('Welcome to Karmaracer !\nWhat\'s your name ?'));
      }
      that.connection.emit('init_done', {
        playerName: Karma.LocalStorage.get('playerName')
      });
      this.init_done = true;
    });

    this.connection.on('chat_msg', function(msg) {
      var key = 'msg_' + that.msg_id;
      Karma.Chat.onChatMsgReceived(msg, key);
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

    this.connection.on('dead', function() {
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

    this.connection.on('game end', function(d) {

      $('table.scores').addClass('big').removeClass('default');

      var removeBigScore = function() {
        $('table.scores').removeClass('big').addClass('default');
      };

      announce(d.winnerName + ' wins the game !!!!', 'black', 'freeze');
      announceIn('2', 'red', 3, 'freeze');
      announceIn('1', 'orange', 4, 'freeze', removeBigScore);
      announceIn('GO', 'green', 5, '');

    });


    that.connection.on('objects', function(objects) {
      gameInstance.items.cars = objects.cars;
      gameInstance.items.mycar = objects.myCar;
      gameInstance.items.projectiles = objects.projectiles;
      gameInstance.items.collisionPoints = objects.collisionPoints;
      gameInstance.updateScoresHTML();

      gameInstance.drawEngine.gScaleDynamicsRequired = true;
      $('#debug-sockets').html(JSON.stringify(_.map(objects, function(list) {
        return list ? list.length : 0;
      })));
      socketReceived();

    });

    that.connection.on('explosion', function(explosion) {
      gameInstance.addExplosion(explosion);
    });

  }

  SocketManager.prototype.getConnection = function() {
    return this.connection;
  };

  SocketManager.prototype.emit = function(key, data) {
    this.connection.emit(key, data);
  };


  Karma.SocketManager = SocketManager;
}(io));
/* public/src/game/SteeringWheelController.js */
(function() {
  "use strict";
  var SteeringWheelController = function() {
    //gameInstance
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


    var toogleEnable = function() {
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

    var startAcceleration = function() {
      if (interval === null) {
        interval = setInterval(send, 1000 / 16);
      }

    };
    var stopAcceleration = function() {
      clearInterval(interval);
      interval = null;
    };



    function angle(b) {
      if (b === null) {
        return 0;
      }
      var a = {
        'x': 0,
        'y': 0
      };
      var res = Math.atan2(b.y, b.x) - Math.atan2(a.y, a.x);
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
  };

  Karma.SteeringWheelController = SteeringWheelController;

}());
/* public/src/game/keyboard.js */
(function() {
  "use strict";

  var KEY_ENTER = 13,
    KEY_SPACE = 32,
    KEY_LEFT = 37,
    KEY_RIGHT = 39,
    KEY_UP = 38,
    KEY_DOWN = 40,
    KEY_ESCAPE = 27,
    KEY_L = 76,
    KEY_P = 80,
    KEY_B = 66;

  function KeyboardHandler(gameInstance) {
    this.gameInstance = gameInstance;
    return this;
  }

  KeyboardHandler.prototype.sendKeyboardEvent = function(event, state) {
    if (this.gameInstance.socketManager.getConnection()) {
      this.gameInstance.socketManager.getConnection().emit('drive', event, state);
    }
  };


  KeyboardHandler.prototype.handleKey = function(key, state) {
    switch (key) {
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
    switch (event.keyCode) {
      case KEY_ESCAPE:
        Karma.Chat.clearChatInputField();
        Karma.Chat.hideChat();
        break;
      case KEY_UP:
      case KEY_DOWN:
        if ($('#chat_input').is(':focus')) {
          Karma.Chat.hideChat();
        }
        this.handleKey(event.keyCode, 'start');
        break;
      case KEY_ENTER:
        if ($('#chat_input').is(':focus')) {
          Karma.Chat.sendMsg();
        } else {
          Karma.Chat.showChat();
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
  };

  Karma.KeyboardHandler = KeyboardHandler;
}());
/* public/src/game/GameInstance/GameInstance.js */
(function() {
  /*global G_mapName*/
  "use strict";

  function GameInstance() {
    Karma.TopBar.setTopBar();


    this.items = {};
    this.items.cars = [];
    this.items.explosions = {};
    this.items.mycar = null;
    this.items.projectiles = [];

    this.worldInfo = {};

    this.drawEngine = null;
    this.socketManager = new Karma.SocketManager(this, this.onInitReceived.bind(this));
    this.setUIEvents();

    this.isMobile = false;

    this.scoresTable = $('tbody#scores');



    // this.loadCars();
    // this.setupSound();
    var that = this;

    function reduceExplosionsAlpha() {
      for (var explosionId in that.items.explosions) {
        that.items.explosions[explosionId].alpha -= 0.05;
        if (that.items.explosions[explosionId].alpha < 0) {
          delete that.items.explosions[explosionId];
        }
      }
    }

    setInterval(reduceExplosionsAlpha, 60);
  }

  GameInstance.prototype.updateScoresHTML = function() {
    var that = this;

    function getScores() {
      var scores = _.map(that.items.cars, function(car) {
        return {
          'score': car.s,
          'level': car.l,
          'name': car.playerName,
          'highScore': car.highScore,
          'id': car.id
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
      var userCarClass = (that.items.mycar !== null && that.items.mycar.id === playerScore.id) ? 'userCar' : '';
      o.push('<tr class="', userCarClass, '"><td>', playerScore.name, '</td><td>', playerScore.score, '</td><td>', playerScore.level, '</td><td>', playerScore.highScore, '</td></tr>');
    }
    this.scoresTable.html(o.join(''));
  };


  GameInstance.prototype.updatePlayerName = function(name) {
    this.socketManager.emit('updatePlayerName', name);
    Karma.LocalStorage.set('playerName', name);
  };

  GameInstance.prototype.setUIEvents = function() {
    var that = this;
    $('#playerName').keyup(function() {
      that.updatePlayerName($(this).val());
    });
  };



  GameInstance.prototype.onInitReceived = function(err, worldInfo) {
    var that = this;
    this.worldInfo = worldInfo;
    this.bullets = [];
    this.rockets = [];

    var defaultDrawEngineType = 'CANVAS';

    var canvasReady = function() {
      that.keyboardHandler = new Karma.KeyboardHandler(that);
      document.onkeydown = that.keyboardHandler.handleKeyDown.bind(that.keyboardHandler);
      document.onkeyup = that.keyboardHandler.handleKeyUp.bind(that.keyboardHandler);
      that.drawEngine.tick();
    };

    that.drawEngine = Karma.getDrawEngine("game-canvas", defaultDrawEngineType, that.items, that.worldInfo, canvasReady);

    new Karma.MiniMap($('body'), G_mapName, that.socketManager.connection);
  };

  GameInstance.prototype.addExplosion = function(explosion) {
    // this.play_sound("/sounds/prou.mp3");
    var explosionId = Math.random();
    this.drawEngine.gScale(explosion);
    this.items.explosions[explosionId] = {
      x: explosion.x,
      y: explosion.y,
      r: 3.14 / 6 * Math.random() - 3.14,
      alpha: 0.4 * Math.random() - 0.2 + 0.25
    };
  };

  Karma.GameInstance = GameInstance;

}());
/* public/src/game/GameInstance/sound.js */
(function() {
  "use strict";

  Karma.GameInstance.prototype.setupSound = function() {
        // function html5_audio() {
    //   var a = document.createElement('audio');
    //   return !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));
    // }
    // this.play_html5_audio = false;
    // if(html5_audio()) this.play_html5_audio = true;
    // this.sounds = {};
    // this.setSound('ta', '/sounds/ta.mp3');
  };

  Karma.GameInstance.prototype.setSound = function(name, url) {
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

  Karma.GameInstance.prototype.play_sound = function(url) {

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
}());
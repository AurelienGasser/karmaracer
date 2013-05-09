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

  var scale2 = 32 * 6;

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
    this.camera = new Karma.Camera(this.ctx, '#' + this.canvasID);
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

  function drawEngineFactory(gameInstance, canvasID, defaultDrawEngineType) {
    var canvas = document.getElementById(canvasID);
    var drawEngineType = defaultDrawEngineType;
    var gl;

    var factory = function(gameInstance, drawEngineType, canvasID, canvas) {
      switch (drawEngineType) {
        case 'CANVAS':
          return new Karma.Engine2DCanvas(gameInstance, canvas, canvasID);
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

    return factory(gameInstance, drawEngineType, canvasID, canvas, gl);
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

  var MiniMap = function($container) {
    this.$container = $container;

    this.$container.append('<canvas class="miniMap"></canvas>');
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
/* public/src/mapmaker/startup.js */
(function(){}());
/* public/src/mapmaker/MapItem.js */
(function() {
  "use strict";

  function MapItem(_jsonItem, _ctx, _id) {
    this.id = _id;
    this.jsonItem = _jsonItem;
    this.position = {
      "x": 0,
      "y": 0
    };
    this.size = {
      "w": this.jsonItem.image.size,
      "h": this.jsonItem.image.size
    };
    this.name = this.jsonItem.name;
    this.patternType = this.jsonItem.patternType;
    this.pattern = undefined;
    this.zIndex = 0;
    this.path = this.jsonItem.image.path;

    this.ctx = _ctx;

    this.image = null;
  }

  MapItem.prototype.initImage = function(callback) {
    this.image = new Image();
    this.image.src = this.jsonItem.image.path;
    this.image.crop = this.jsonItem.image.crop;

    var that = this;

    that.image.onerror = function() {};

    that.image.onload = function() {

      if (that.patternType !== "none" && !KLib.isUndefined(that.ctx)) {
        that.pattern = that.ctx.createPattern(that.image, 'repeat');
      } else {}
      return callback(null, that);
    };

  };


  MapItem.prototype.scale = function(canvasMousePosition, scaleMousePosition, keyPress) {
    var translateVector;
    var diffx = canvasMousePosition.x - scaleMousePosition.x;
    var diffy = canvasMousePosition.y - scaleMousePosition.y;
    if (keyPress.shift) {
      var min = Math.min(diffx, diffy);
      translateVector = {
        "x": min,
        "y": min
      };
    } else {
      translateVector = {
        "x": diffx,
        "y": diffy
      };
    }
    if (this.patternType == 'vertical') {
      this.size.w = this.image.crop.w;
    } else {
      this.size.w += translateVector.x;
    }
    if (this.patternType == 'horizontal') {
      this.size.h = this.image.crop.h;
    } else {
      this.size.h += translateVector.y;
    }
    // To prevent negative dimensions
    this.size.w = Math.max(this.size.w, 1);
    this.size.h = Math.max(this.size.h, 1);
  };
  Karma.MapItem = MapItem;
}());
/* public/src/mapmaker/mapmaker.js */
(function() {
  "use strict";

  function addProperties(map) {

    setNameEvents(map);
    setBackgroundItemsEvents(map);
    setSizeEvents(map);
  }

  function setNameEvents(map) {
    var inputName = $('#map-name');
    inputName.keyup(function() {
      map.mapName = inputName.val();
      map.loadMap(map.mapName);
    });
    inputName.val(map.mapName);
  }


  function setSizeEvents(map) {
    var widthDOM = $('#map-width');
    var heightDOM = $('#map-height');

    function updateSizeFromDOM() {
      var w = parseInt(widthDOM.val(), 10) * map.gScale;
      var h = parseInt(heightDOM.val(), 10) * map.gScale;
      map.realWorldSize.w = w;
      map.realWorldSize.h = h;
      map.resize();
    }

    widthDOM.change(updateSizeFromDOM);
    heightDOM.change(updateSizeFromDOM);
  }


  function setBackgroundItemsEvents(map) {
    var inputName = $('#map-bg');

    var o = [];
    o.push('<datalist id="bg-list">');
    for (var i = 0; i < map.backgroundItems.length; i++) {
      var bg = map.backgroundItems[i];
      o.push('<option value="', bg.name, '">');
      o.push(bg.name, '</option>');
    }
    o.push('</datalist>');

    inputName.after(o.join(''));
    inputName.keyup(function() {
      map.mapBackgroundName = inputName.val();
      map.svgDrawBackground();
    });
    inputName.val(map.mapBackgroundName);
  }


  function start() {

    var mapID = "map-canvas";

    var map = new Karma.Map('#' + mapID);
    // console.log(Map, map);
    //var items = ['wall', 'stone', 'grass', 'grass3', 'stone_l', 'stone_r', 'stone_t', 'stone_b', 'tree1'];
    map.connection.emit('get_items', function(err, itemsByName) {
      var items = [];
      for (var itemName in itemsByName) {
        items.push(itemsByName[itemName]);
      }
      map.loadItems(items, function() {
        map.loadMap(map.mapName, function() {
          addProperties(map);
          //map.startTick();
          map.svgInit(mapID);
        });
      });
    });

    $("#save-map-node").click(function() {
      map.saveMap();
    });
  }

  $(function() {

    start();

  });

}());
/* public/src/mapmaker/Map/Map.js */
/*global G_mapName, io*/

(function(io) {
  "use strict";

  function Map(selector) {

    var host = window.location.hostname;
    this.connection = io.connect(host);

    this.MapItems = {};
    this.selectedItems = [];
    this.canvasMousePosition = {
      "x": 0,
      "y": 0
    };
    this.mouseDownPosition = {
      "x": 0,
      "y": 0
    };
    this.translateMousePosition = {
      "x": 0,
      "y": 0
    };

    this.idCount = 0;


    this.keyPress = {
      shift: false
    };

    this.selectedZone = {
      "x": 0,
      "y": 0,
      "w": 0,
      "h": 0
    };
    this.keyboardHandler = new Karma.KeyboardHandlerMap(this);

    this.scale = 1;
    this.gScale = 16;

    this.translate = {
      "x": 0,
      "y": 0
    };
    this.realWorldSize = {
      "w": 64 * this.gScale,
      "h": 32 * this.gScale
    };
    this.mapName = G_mapName;
    this.mapBackgroundName = '';
    this.itemsByName = {};
    this.zoomBox = null;
    this.enable = false;
    this.backgroundItems = [];

    this.$map = $(selector);

    this.$map.css('width', this.realWorldSize.w).css('height', this.realWorldSize.h);


    this.itemsGlow = {};
  }


  Map.prototype.resize = function() {
    this.$map.css('width', this.realWorldSize.w).css('height', this.realWorldSize.h);
  };

  Map.prototype.loadMap = function(mapName, callback) {
    var that = this;
    that.connection.emit('get_map', mapName, function(err, map) {
      if (err !== null) {
        Karma.Log.error('no map with name', mapName);
        return callback({
          'msg': 'no map with name',
          'type': 'warn'
        });
      }
      that.mapBackgroundName = map.background.name;
      that.enable = map.enable;

      $('#map-width').val(map.size.w);
      $('#map-height').val(map.size.h);
      var $enable = $('#map-enable');

      if (map.enable === true) {
        $enable.prop('checked', true);
      }
      $enable.click(function() {
        that.enable = this.checked;
      });

      that.realWorldSize.w = map.size.w * that.gScale;
      that.realWorldSize.h = map.size.h * that.gScale;


      that.resize();
      for (var i = 0; i < map.staticItems.length; i++) {
        var sItem = map.staticItems[i];
        var sItemFull = that.itemsByName[sItem.name];

        var mapItem = that.createMapItem(sItemFull);
        mapItem.position.x = sItem.position.x * that.gScale;
        mapItem.position.y = sItem.position.y * that.gScale;
        mapItem.size.w = sItem.size.w * that.gScale;
        mapItem.size.h = sItem.size.h * that.gScale;
      }

      // if (!KLib.isUndefined(that.svgTag)){
      //   that.svgLoad();
      // }

      if (_.isFunction(callback)) {
        return callback(null);
      }

    });
  };


  Map.prototype.startTick = function() {
    var now = new Date();
    this.tickStart = now.getTime();
    this.tickCount = 0;
    this.tick();
  };



  Map.prototype.outputDebug = function() {

    var debugoutput = [];
    debugoutput.push('<li>Canvas Mouse Pos : ', this.canvasMousePosition.x, ', ', this.canvasMousePosition.y, '</li>');
    debugoutput.push('<li>Canvas Down Pos : ', this.mouseDownPosition.x, ', ', this.mouseDownPosition.y, '</li>');
    debugoutput.push('<li>Translate Down Pos : ', this.translateMousePosition.x, ', ', this.translateMousePosition.y, '</li>');

    debugoutput.push('<li>Action : ', this.action, '</li>');
    debugoutput.push('<li>ScaleCanvas : ', this.scale, '</li>');
    debugoutput.push('<li>TranslateCanvas : ', this.translate.x, ', ', this.translate.y, '</li>');

    debugoutput.push('<li>--------</li>');
    debugoutput.push('<li>Help</li>');
    debugoutput.push('<li>Arrows (move canvas)</li>');
    debugoutput.push('<li>R (release items)</li>');
    debugoutput.push('<li>P/L (zoom/unzoom)</li>');
    debugoutput.push('<li>S (set scale to 1)</li>');
    debugoutput.push('<li>Z (zoom to selected items)</li>');

    $("#canvas-debug").html(debugoutput.join(''));
  };

  Map.prototype.tick = function() {
    this.tickCount++;

    var now = new Date();
    var tickDiff = now.getTime() - this.tickStart;
    if (tickDiff > 1000) {
      $('#fps').html('fps:' + this.tickCount);
      this.tickCount = 0;
      this.tickStart = now.getTime();
    }
    requestAnimFrame(this.tick.bind(this));
    //this.canvasDraw();
    //this.svgDraw();
    this.outputDebug();

  };


  function step(items, action, callback) {
    var itemsLength = items.length;
    var itemCount = 0;

    function end() {
      if (itemCount === itemsLength - 1) {
        if (_.isFunction(callback)) {
          return callback(null);
        }
      }
      itemCount += 1;
    }
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      action(item, end);
    }
  }

  Map.prototype.loadItems = function(items, callback) {
    var that = this;
    step(items, function(itemName, end) {
      that.loadItemFromServer(itemName, function() {
        return end();
      });
    }, callback);
  };



  Map.prototype.addMapItemInDoForSelection = function(items, item) {


    var that = this;
    var itemID = 'item-' + item.name;
    var itemLi = $('<li class="item" id="' + itemID + '"></li>');
    var UL = $('<ul class="item-properties"/>');
    itemLi.append(UL);
    var demoDiv = $('<li class="kr-mm-demo"/>');


    function setBackground() {
      demoDiv.css('background-image', 'url("' + item.image.src + '")');
    }

    switch (item.patternType) {
      case 'both':
        var bgItem = {
          'name': item.name,
          'path': item.image.src
        };
        that.backgroundItems.push(bgItem);
        setBackground();
        break;
      case 'horizontal':
        setBackground();
        break;
      case 'vertical':
        setBackground();
        break;
      default:
        demoDiv.append('<img class="kr-item-demo" src="' + item.image.src + '"/>');
    }
    demoDiv.addClass('kr-mm-demo-' + item.patternType);
    UL.append('<li class="kr-pp-item-name">' + item.name + '</li>');

    UL.append(demoDiv);
    items.append(itemLi);

    $('#' + itemID).click(function() {
      var sourceMapItem = that.itemsByName[item.name];
      Karma.Log.info('add map item', sourceMapItem);
      var mapItem = that.createMapItem(sourceMapItem);
      mapItem.size.w = sourceMapItem.size.w * that.gScale;
      mapItem.size.h = sourceMapItem.size.h * that.gScale;
      that.svgRaphaelAddItem(mapItem);
    });

  };

  Map.prototype.createMapItem = function(sourceMapItem) {
    var that = this;
    var timestamp = that.idCount++;
    var mapItem = new Karma.MapItem(sourceMapItem, that.ctx, timestamp);
    mapItem.image = sourceMapItem.image;
    mapItem.pattern = sourceMapItem.pattern;
    that.MapItems[timestamp] = mapItem;
    return mapItem;
  };

  Map.prototype.removeMapItem = function(id) {
    delete this.MapItems[id];
  };

  Map.prototype.loadItemFromServer = function(item, callback) {
    var that = this;
    var itemsDOMContainer = $('#items');
    if (_.isFunction(callback)) {
      var mapItem = new Karma.MapItem(item, that.ctx, item.name);

      mapItem.initImage(function(err, mapItemWithImage) {
        that.addMapItemInDoForSelection(itemsDOMContainer, mapItemWithImage);
        that.itemsByName[mapItem.name] = mapItemWithImage;
        return callback(null, mapItemWithImage);
      });
    }
  };

  Karma.Map = Map;

}(io));
/* public/src/mapmaker/Map/actions.js */
(function(Map) {
  "use strict";
  
  Map.prototype.startTranslating = function() {
    this.action = 'translate';
    this.translateMousePosition = this.mouseDownPosition;
  };

  Map.prototype.translateSelectedItemsUsingMousePosition = function() {
    var translateVector = {
      "x": this.canvasMousePosition.x - this.translateMousePosition.x,
      "y": this.canvasMousePosition.y - this.translateMousePosition.y
    };
    _.each(this.selectedItems, function(id) {
      var item = this.MapItems[id];
      item.position = {
        "x": item.position.x + translateVector.x,
        "y": item.position.y + translateVector.y
      };
    }.bind(this));
    this.translateMousePosition = this.canvasMousePosition;
  };

  Map.prototype.startScaling = function() {
    this.action = 'scale';
    this.scaleMousePosition = this.mouseDownPosition;
  };

  Map.prototype.scaleItemsUsingCanvasMouse = function() {
    _.each(this.selectedItems, function(id) {
      var item = this.MapItems[id];
      item.scale(this.canvasMousePosition, this.scaleMousePosition, this.keyPress);
    }.bind(this));
    this.scaleMousePosition = this.canvasMousePosition;
  };

}(Karma.Map));
/* public/src/mapmaker/Map/drawCanvas.js */
(function(Map) {
  "use strict";

  Map.prototype.canvasInit = function(selector) {


    var canvasID = 'canvas-map';
    this.canvasTag = $('<canvas id="' + canvasID + '"/>');
    $(selector).append(this.canvasTag);

    this.canvas = $(selector).children('canvas')[0];
    this.ctx = this.canvas.getContext("2d");

    this.canvas.onmousemove = this.mouseMove.bind(this);
    this.canvas.onmousedown = this.mouseDown.bind(this);
    this.canvas.onmouseup = this.mouseUp.bind(this);
    this.canvasTag.css('width', this.realWorldSize.w).css('height', this.realWorldSize.h);
  };

  Map.prototype.canvasDrawBackground = function() {
    if (this.mapBackgroundName !== '') {
      var bg = this.itemsByName[this.mapBackgroundName];
      if (!KLib.isUndefined(bg)) {
        this.ctx.fillStyle = bg.pattern;
        this.ctx.fillRect(0, 0, this.realWorldSize.w, this.realWorldSize.h);
      }
    }
  };

  Map.prototype.canvasDraw = function() {
    this.ctx.canvas.width = $(this.canvas).width();
    this.ctx.canvas.height = $(this.canvas).height();

    this.ctx.save();

    this.ctx.scale(this.scale, this.scale);

    this.canvasDrawBackground();

    //draw world border
    this.ctx.fillStyle = '00f';
    this.ctx.strokeRect(0, 0, this.realWorldSize.w, this.realWorldSize.h);


    this.ctx.translate(this.translate.x, this.translate.y);
    this.ctx.scale(this.scale, this.scale);


    for (var i in this.MapItems) {
      var item = this.MapItems[i];
      this.canvasDrawItem(item);
    }

    // draw selected Zone
    if (this.action == 'selectZone') {
      this.canvasDrawSelectedZone();
    }


    this.ctx.restore();


    if (this.zoomBox !== null) {
      this.scale = this.realWorldSize.w * this.scale / this.zoomBox.w;
      this.translate.x = -this.zoomBox.x * this.scale;
      this.translate.y = -this.zoomBox.y * this.scale;
      this.zoomBox = null;
    }
  };

  Map.prototype.canvasDrawItem = function(item) {

    var isItemSelected = _.include(this.selectedItems, item.id);

    if (isItemSelected) {
      this.ctx.shadowOffsetX = 2;
      this.ctx.shadowOffsetY = 2;
      this.ctx.shadowBlur = 4;
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    } else {
      this.ctx.shadowBlur = 0;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 0;
    }
    if (item.patternType !== "none") {
      this.ctx.fillStyle = item.pattern;
      this.ctx.save();
      this.ctx.translate(item.position.x, item.position.y);
      this.ctx.fillRect(0, 0, item.size.w, item.size.h);
      this.ctx.restore();
    } else {
      this.ctx.drawImage(item.image, item.position.x, item.position.y, item.size.w, item.size.h);
    }
    if (isItemSelected) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.fillRect(item.position.x + item.size.w * 0.8, item.position.y + item.size.h * 0.8, item.size.w * 0.2, item.size.h * 0.2);
    }
  };

  Map.prototype.canvasDrawSelectedZone = function() {
    this.selectedZone.x = this.mouseDownPosition.x;
    this.selectedZone.y = this.mouseDownPosition.y;
    this.selectedZone.w = this.canvasMousePosition.x - this.mouseDownPosition.x;
    this.selectedZone.h = this.canvasMousePosition.y - this.mouseDownPosition.y;
    if (this.selectedZone.w < 0) {
      this.selectedZone.x += this.selectedZone.w;
      this.selectedZone.w *= -1;
    }
    if (this.selectedZone.h < 0) {
      this.selectedZone.y += this.selectedZone.h;
      this.selectedZone.h *= -1;
    }
    this.ctx.strokeStyle = 'f00';
    this.ctx.strokeRect(this.selectedZone.x, this.selectedZone.y, this.selectedZone.w, this.selectedZone.h);
  };

}(Karma.Map || {}));
/* public/src/mapmaker/Map/drawSvg.js */
(function(Map) {
  /*global Raphael*/
  "use strict";


  Map.prototype.svgRaphaelAddItem = function(item) {

    item.position.x -= item.size.w / 2;
    item.position.y -= item.size.h / 2;

    var that = this;
    var opacityStart = 1;
    var opacityDrag = 0.5;
    var c = this.R.rect(item.position.x, item.position.y, item.size.w, item.size.h).attr({
      //fill: "hsb(.8, 1, 1)",
      fill: "url('" + item.image.src + "')",
      stroke: "none",
      opacity: opacityStart,
      cursor: "move"
    });
    var size = 32;

    var s = this.R.rect(item.position.x + item.size.w - size, item.position.y + item.size.h - size, size, size).attr({
      fill: "hsb(0.8, 0.5, .5)",
      stroke: "none",
      opacity: opacityStart
    });


    var li = $('<li></li>');


    function getJOption(optName) {
      var opt = $('<div><a href="#">' + optName + '</a></div>');
      return opt;
    }

    function addOption(optName) {
      var opt = getJOption(optName);
      opt.click(function(e) {

        if (optName === 'toFront') {
          c[optName]();
          s[optName]();
        } else {
          s[optName]();
          c[optName]();
          that.bgImg.toBack();
        }

        e.preventDefault();
        return false;
      });
      li.append(opt);
    }

    addOption('toFront');
    addOption('toBack');
    var remove = getJOption('removeItem');
    li.append(remove);
    // li.append('size' + JSON.stringify(c.sizer) + c.sizer.attr('x'));
    // li.append('</br>pos' + JSON.stringify(item.position));
    remove.click(function() {
      that.removeMapItem(item.id);
      $(c.node).remove();
      $(s.node).remove();
    });

    c.li = li;
    $('#canvas-debug').append(li);
    $('#canvas-debug').children().hide();

    // start, move, and up are the drag functions
    var start = function() {
      // storing original coordinates
      this.ox = this.attr("x");
      this.oy = this.attr("y");
      this.attr({
        opacity: opacityDrag
      });

      this.sizer.ox = this.sizer.attr("x");
      this.sizer.oy = this.sizer.attr("y");
      this.sizer.attr({
        opacity: opacityStart
      });
    };
    var move = function(dx, dy) {
      // move will be called with dx and dy
      this.attr({
        x: this.ox + dx,
        y: this.oy + dy
      });
      item.position.x = this.ox + dx;
      item.position.y = this.oy + dy;
      this.sizer.attr({
        x: this.sizer.ox + dx,
        y: this.sizer.oy + dy
      });
      if (item.position.x < 0) {
        // this.sizer.attr('x', 0);
        item.position.x = 0;
      }
      if (item.position.y < 0) {
        // this.sizer.attr('y', 0);
        item.position.y = 0;
      }


    };
    var up = function() {
      // restoring state
      this.attr({
        opacity: opacityStart
      });
      this.sizer.attr({
        opacity: opacityStart
      });
    };
    var rstart = function() {
      // storing original coordinates
      this.ox = this.attr("x");
      this.oy = this.attr("y");

      this.box.ow = this.box.attr("width");
      this.box.oh = this.box.attr("height");
    };
    var rmove = function(dx, dy) {
      // move will be called with dx and dy
      this.attr({
        x: this.ox + dx,
        y: this.oy + dy
      });
      this.box.attr({
        width: this.box.ow + dx,
        height: this.box.oh + dy
      });
      item.size.w = this.box.attr("width");
      item.size.h = this.box.attr("height");

    };
    // rstart and rmove are the resize functions;
    $(c.node).click(function(e) {
      $('#canvas-debug').children().hide();
      c.li.show();


      li.find('div.mm-clean').remove();
      // li.append('size' + JSON.stringify(c.sizer) + c.sizer.attr('x'));
      li.append('<div class="mm-clean">pos : ' + JSON.stringify(item.position) + '</div>');
      li.append('<div class="mm-clean">size : ' + JSON.stringify(item.size) + '</div>');


      e.preventDefault();
      return false;
    });
    c.drag(move, start, up);
    c.sizer = s;
    s.drag(rmove, rstart);
    s.box = c;
    return c;
  };


  Map.prototype.svgInit = function(containerID) {

    this.R = new Raphael(containerID, this.realWorldSize.w, this.realWorldSize.h);
    $(this.R.canvas).click(function(e) {
      $('#canvas-debug').children().hide();
      e.preventDefault();
      return false;
    });
    this.svgLoad();
  };


  Map.prototype.svgLoad = function() {
    this.svgDraw();
  };

  Map.prototype.svgDraw = function() {
    this.svgDrawBackground();
    for (var i in this.MapItems) {
      var item = this.MapItems[i];
      this.svgRaphaelAddItem(item);
    }

  };



  Map.prototype.svgDrawBackground = function() {
    if (!KLib.isUndefined(this.bgImg)) {
      $(this.bgImg.node).remove();
    }
    if (this.mapBackgroundName !== '') {
      var bg = this.itemsByName[this.mapBackgroundName];
      if (!KLib.isUndefined(bg)) {

        this.bgImg = this.R.rect(0, 0, this.realWorldSize.w, this.realWorldSize.h);
        this.bgImg.attr({
          "fill": "url('" + bg.path + "')"
        });
      }
    }
  };

}(Karma.Map || {}));
/* public/src/mapmaker/Map/keyboard.js */
(function() {
  "use strict";

  function KeyboardHandlerMap(_canvasMap) {
    this.canvasMap = _canvasMap;
    document.onkeydown = this.handleKeyDown.bind(this);
    document.onkeyup = this.handleKeyUp.bind(this);
  }

  KeyboardHandlerMap.prototype.handleKey = function(key, down) {
    switch (key) {
      case 37:
        // left arrow
        this.canvasMap.translate.x += 5;
        break;
      case 39:
        // right arrow
        this.canvasMap.translate.x -= 5;
        break;
      case 38:
        // up arrow
        this.canvasMap.translate.y += 5;
        break;
      case 40:
        // down arrow
        this.canvasMap.translate.y -= 5;
        break;
      case 90:
        // Z
        if (!down) break;
        this.canvasMap.zoomToSelectedItems();
        break;
      case 83:
        // S
        if (!down) break;
        this.canvasMap.scale = 1;
        this.canvasMap.translate = {
          "x": 0,
          "y": 0
        };
        break;
      case 76:
        // L
        if (!down) break;
        this.canvasMap.scale *= 1.1;
        break;
      case 77:
        // M
        this.canvasMap.actionTranslate = down;
        if (down) {
          this.canvasMap.mouseDownPosition = this.canvasMap.canvasMousePosition;
        }
        break;
      case 80:
        // P
        if (!down) break;
        this.canvasMap.scale *= 0.9;
        break;
      case 82:
        // R
        if (down) {
          this.canvasMap.deselectAllItems();
        }
        break;
      case 16:
        // Shift
        this.canvasMap.keyPress.shift = down;
        break;
      default:
        //console.info(key);
    }
  };

  KeyboardHandlerMap.prototype.handleKeyDown = function(event) {
    this.handleKey(event.keyCode, true);
  };

  KeyboardHandlerMap.prototype.handleKeyUp = function(event) {
    this.handleKey(event.keyCode, false);
  };

  Karma.KeyboardHandlerMap = KeyboardHandlerMap;

}());
/* public/src/mapmaker/Map/mouse.js */
(function(Map) {
  "use strict";

  Map.prototype.mouseDown = function() {
    this.mouseDownPosition = this.canvasMousePosition;
    this.action = '';
    if (this.keyPress.shift) {
      _.each(this.MapItems, function(item) {
        if (this.isMousePositionInItem(item)) {
          if (this.isItemSelected(item.id)) {
            this.deselectItem(item.id);
          } else {
            this.selectItem(item.id);
          }
        }
      }.bind(this));
    } else {
      _.each(this.MapItems, function(item) {
        if (this.isMousePositionInItem(item)) {
          if (!this.isItemSelected(item.id)) {
            this.deselectAllItems();
            this.selectItem(item.id);
          }
          this.mouseDownOnItem = item;
          if (this.mouseDownInItemScaleZone(item, 0.8)) {
            this.startScaling();
          } else {
            this.startTranslating();
          }
        }
      }.bind(this));
      if (this.action != 'translate' && this.action != 'scale') {
        this.deselectAllItems();
        this.action = 'selectZone';
      }
    }
  };

  Map.prototype.mouseMove = function(e) {
    this.canvasMousePosition = {
      "x": e.pageX - this.canvas.offsetLeft - this.translate.x,
      "y": e.pageY - this.canvas.offsetTop - this.translate.y
    };
    this.canvasMousePosition.x *= 1 / this.scale;
    this.canvasMousePosition.y *= 1 / this.scale;
    var scale_cursor = 's-resize';
    if (this.action == 'scale') {
      document.body.style.cursor = scale_cursor;
    } else {
      var inScaleZone = false;
      _.each(this.MapItems, function(item) {
        if (inScaleZone) {
          return;
        }
        if (this.mouseDownInItemScaleZone(item, 0.9)) {
          // cursor over scale zome
          inScaleZone = true;
        }
      }.bind(this));
      if (inScaleZone) {
        document.body.style.cursor = scale_cursor;
      } else {
        document.body.style.cursor = 'default';
      }
    }
    // left click is pressed
    if (e.button === 0 && e.which === 1) {
      switch (this.action) {
        case 'translate':
          this.translateSelectedItemsUsingMousePosition();
          break;
        case 'scale':
          this.scaleItemsUsingCanvasMouse();
          break;
      }
    }
  };

  Map.prototype.mouseUp = function() {
    switch (this.action) {
      case 'selectZone':
        this.selectItemsInSelectedZone();
        break;
      case 'scale':
      case 'translate':
        break;
      default:
        break;
    }
    this.action = '';
  };

}(Karma.Map));
/* public/src/mapmaker/Map/save.js */
(function(Map) {
  "use strict";


  Map.prototype.saveMap = function() {

    var that = this;
    var iWidth = this.realWorldSize.w;
    var iHeight = this.realWorldSize.h;

    // this.canvas.toDataURL("image/png");
    var map = {
      "name": $('#map-name').val(),
      "enable": that.enable,
      "size": {
        "w": parseInt(iWidth / this.gScale, 10),
        "h": iHeight / this.gScale
      }
    };

    var path = '/sprites/bg_grass1.png';
    var itemBG = this.itemsByName[this.mapBackgroundName];
    if (!KLib.isUndefined(itemBG)) {
      path = itemBG.path;
    }

    if (!KLib.isUndefined(path)) {
      map.background = {
        'path': path,
        'name': this.mapBackgroundName
      };
    }
    map.staticItems = [];
    $.each(this.MapItems, function(id, item) {
      var jsonItem = {};
      jsonItem.name = item.name;
      jsonItem.position = {
        x: (item.position.x + item.size.w / 2) / that.gScale,
        y: (item.position.y + item.size.h / 2) / that.gScale
      };
      jsonItem.size = {
        w: parseInt(item.size.w / that.gScale, 10),
        h: parseInt(item.size.h / that.gScale, 10)
      };
      map.staticItems.push(jsonItem);
    });
    // var mapString = JSON.stringify(map);

    // var $c = $('<canvas id="canvasSave"></canvas>');
    // $('body').append($c)
    // var svg = this.$map.html().replace(/>\s+/g, ">").replace(/\s+</g, "<");
    // canvg('canvasSave', svg, {
    //   renderCallback: function() {
    //     var img = $c[0].toDataURL("image/png");

    //     var img = Canvas2Image.saveAsPNG($c[0], true);
    //     $("body").append(img);

    //   },
    //   ignoreMouse: true,
    //   ignoreAnimation: true
    // });


    this.connection.emit('saveMap', map);
  };
}(Karma.Map));
/* public/src/mapmaker/Map/select.js */
(function(Map) {
  "use strict";


  Map.prototype.zoomToSelectedItems = function() {
    var itemMostLeft;
    var itemMostRight;
    var itemMostTop;
    var itemMostBottom;
    _.each(this.selectedItems, function(id) {
      var item = this.MapItems[id];
      if (typeof itemMostLeft === "undefined") {
        itemMostLeft = item;
      }
      if (typeof itemMostRight === "undefined") {
        itemMostRight = item;
      }
      if (typeof itemMostTop === "undefined") {
        itemMostTop = item;
      }
      if (typeof itemMostBottom === "undefined") {
        itemMostBottom = item;
      }
      if (item.position.x < itemMostLeft.position.x) itemMostLeft = item;
      if (item.position.x + item.size.w > itemMostRight.position.x + itemMostRight.size.w) itemMostRight = item;
      if (item.position.y < itemMostTop.position.y) itemMostTop = item;
      if (item.position.y + item.size.h > itemMostBottom.position.y + itemMostBottom.size.h) itemMostBottom = item;
    }.bind(this));
    var margin = 20;
    if (this.selectedItems.length > 0) {
      this.zoomBox = {
        "x": itemMostLeft.position.x - margin,
        "y": itemMostTop.position.y - margin,
        "w": itemMostRight.position.x + itemMostRight.size.w - itemMostLeft.position.x + 2 * margin,
        "h": itemMostBottom.position.y + itemMostBottom.size.h - itemMostTop.position.y + 2 * margin
      };
    }
  };

  Map.prototype.mouseDownInItemScaleZone = function(item, scaleZonePercentage) {
    if (this.canvasMousePosition.x < item.position.x + item.size.w * scaleZonePercentage) return false;
    if (this.canvasMousePosition.x > item.position.x + item.size.w) return false;
    if (this.canvasMousePosition.y < item.position.y + item.size.h * scaleZonePercentage) return false;
    if (this.canvasMousePosition.y > item.position.y + item.size.h) return false;
    return true;
  };


  Map.prototype.selectItemsInSelectedZone = function() {
    _.each(this.MapItems, function(item) {
      if (item.position.x < this.selectedZone.x) return;
      if (item.position.y < this.selectedZone.y) return;
      if (item.position.x + item.size.w > this.selectedZone.x + this.selectedZone.w) return;
      if (item.position.y + item.size.h > this.selectedZone.y + this.selectedZone.h) return;
      this.selectItem(item.id);
    }.bind(this));
  };

  Map.prototype.isMousePositionInItem = function(item) {
    if (this.canvasMousePosition.x < item.position.x) return false;
    if (this.canvasMousePosition.x > item.position.x + item.size.w) return false;
    if (this.canvasMousePosition.y < item.position.y) return false;
    if (this.canvasMousePosition.y > item.position.y + item.size.h) return false;
    return true;
  };


  Map.prototype.deselectAllItems = function() {
    for (var id in this.itemsGlow) {
      this.deselectItem(id);
    }
    this.selectedItems = [];
  };

  Map.prototype.isItemSelected = function(id) {
    return _.include(this.selectedItems, id);
  };

  Map.prototype.selectItem = function(id, rect) {
    this.selectedItems.push(id);

    if (!KLib.isUndefined(rect)) {
      rect.isSelected = true;
      this.itemsGlow[id] = rect;
      $(rect).attr('stroke', '#000');
      $(rect.rectSelected).show();
    }

  };

  Map.prototype.deselectItem = function(id) {
    this.selectedItems.splice(this.selectedItems.indexOf(id), 1);
    var rect = this.itemsGlow[id];
    if (!KLib.isUndefined(rect)) {
      rect.isSelected = false;
      $(rect.rectSelected).hide();
      $(rect).attr('stroke', 'transparent');
    }
  };

}(Karma.Map));
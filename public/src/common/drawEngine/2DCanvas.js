(function() {
  "use strict";

  function Engine2DCanvas(canvas, canvasID, items, worldInfo, gScale, connection, callback) {

    this.canvas = canvas;
    this.canvasID = canvasID;
    this.timer = new Date().getTime();
    this.frames = 0;
    this.debugDraw = false;
    this.carFlameTicks = {};
    this.isMiniMap = false;
    this.fps = undefined; // will be defined by requestAnimFrame

    this.items = items;
    this.worldInfo = worldInfo;

    this.connection = connection;
    this.setGScale(gScale);
    this.$canvas = $(canvas);
    this.$canvas.focus();
    this.init();
    this.loaded();
    this.loadImages(callback);
    this.movementSmoothingIntervals = {};
  }


  Engine2DCanvas.prototype.setGScale = function(gScaleValue) {
    this.gScaleValue = gScaleValue;
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
        that.worldInfo.itemsInMap[this.name].img = img;
      } else {
        that.worldInfo.itemsInMap[this.name].pattern = null;
      }
      imageLoaded();
    };

    for (var itemName in this.worldInfo.itemsInMap) {
      var item = this.worldInfo.itemsInMap[itemName];

      var img = new Image();
      img.src = item.image.path;
      img.onload = onLoadImage.bind(item);
      item.img = img;
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


  Engine2DCanvas.prototype.gScale = function(e) {
    if (e === null) {
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
    this.ctx.font = '10px Trebuchet MS';
    this.canvas.width = this.$canvas.width();
    this.canvas.height = this.$canvas.height();
    this.camera = new Karma.Camera(this.ctx, '#' + this.canvasID);
    this.camera.setWorldSize(this.worldInfo.size);
    this.loadCars();
    this.explosionImage = new Image();
    this.explosionImage.src = '/sprites/explosion.png';
    this.rocketImage = new Image();
    this.rocketImage.src = '/sprites/rocket.png';
    this.gunFlameImage = new Image();
    this.gunFlameImage.src = '/sprites/gun_flame.png';
    this.$window = $(window);

  };

  Engine2DCanvas.prototype.loaded = function() {
    Karma.Loading.remove();
  };

  var toto = 0;

  Engine2DCanvas.prototype.resize = function() {
    var size = {
      w: this.$canvas.width(),
      h: this.$canvas.height()
    };
    if (!KLib.isUndefined(this.canvasSize)) {
      size = this.canvasSize;
    }
    this.canvas.width = size.w;
    this.canvas.height = size.h;
  };

  Engine2DCanvas.prototype.draw = function() {
    if (this.worldInfo.staticItems.length > 0) {
      this.resize();
      if (this.isMiniMap === false) {
        var newCenter = this.oldCenter;
        if (this.items.mycar !== null) {
          newCenter = {
            x: this.items.mycar.x * this.gScaleValue,
            y: this.items.mycar.y * this.gScaleValue
          };
          this.camera.update(newCenter);
        }
        if (newCenter && newCenter != this.oldCenter) {
          this.oldCenter = newCenter;
        }
      }

      this.drawItems();
    }
  };



  var explosionWidth = 56;
  var explosionHeight = 51;

  Engine2DCanvas.prototype.drawExplosions = function(ctx) {
    if (this.items.explosions !== null) {
      ctx.fillStyle = '#FFFFFF';
      for (var i in this.items.explosions) {
        var c = this.items.explosions[i];
        var pos = {
          x: this.gScaleValue * c.x,
          y: this.gScaleValue * c.y
        };
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
        var pos = {
          x: c.x * this.gScaleValue,
          y: c.y * this.gScaleValue
        };
        switch (c.name) {
          case 'rocket launcher':
            this.drawRocket(c, ctx);
            break;
          default:
            this.drawBullet(c, ctx, pos);
            break;
        }
      }
    }
  };

  Engine2DCanvas.prototype.drawBullet = function(bullet, ctx, pos) {
    ctx.fillStyle = '#0F0';
    var c = bullet;
    ctx.save();
    ctx.beginPath();
    var a = c;
    ctx.translate(pos.x, pos.y);
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

    this.draw();

    this.frames++;
    var now = new Date().getTime();
    if (now - this.timer > 1000) {
      this.timer = now;
      this.fps = this.frames;
      $('#fps').html('fps: ' + this.fps);
      this.frames = 0;
    }
  };

  Karma.Engine2DCanvas = Engine2DCanvas;
}());
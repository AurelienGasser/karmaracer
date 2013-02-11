function Engine2DCanvas(gameInstance, canvas, canvasID) {
  this.canvas = canvas;
  this.canvasID = canvasID;
  this.gameInstance = gameInstance;
  this.init();
  this.loaded();
  this.timer = new Date().getTime();
  this.frames = 0;
  //$('#debug').append('<div id="fps" class="info"/>');
  return this;
}

Engine2DCanvas.prototype.initBackgroundCanvas = function() {
  this.backgroundCanvas = document.createElement('canvas');

  var wSize = this.camera.realWorldSize;

  var scale = 1;
  this.backgroundCanvas.width = wSize.w * scale;
  this.backgroundCanvas.height = wSize.h * scale;

  this.backgroundContext = this.backgroundCanvas.getContext("2d");
  this.backgroundContext.save();
  this.drawBackground(this.backgroundContext);
  this.drawOutsideWalls(this.backgroundContext);
  this.drawStaticItems(this.backgroundContext);
  this.backgroundContext.restore();
};

Engine2DCanvas.prototype.init = function() {
  this.ctx = this.canvas.getContext("2d");
  this.canvas.width = $('#' + this.canvasID).width();
  this.canvas.height = $('#' + this.canvasID).height();
  this.camera = new Camera(this.ctx, '#' + this.canvasID);
  this.camera.setWorldSize(this.gameInstance.world.size);
  this.carImage = new Image();
  this.carImage.src = '/sprites/car.png';
  this.explosionImage = new Image();
  this.explosionImage.src = '/sprites/explosion.png';
  this.rocketImage = new Image();
  this.rocketImage.src = '/images/rocket.png';
};

Engine2DCanvas.prototype.loaded = function() {
  $('#loadingtext').html('');
};

Engine2DCanvas.prototype.draw = function() {
  if(this.gameInstance.walls.length > 0) {
    this.camera.ctx.canvas.width = $('#' + this.canvasID).width();
    this.camera.ctx.canvas.height = $('#' + this.canvasID).height();
    var newCenter = this.gameInstance.mycar || this.oldCenter;
    this.camera.update(newCenter);
    if(newCenter && newCenter != this.oldCenter) {
      this.oldCenter = newCenter;
    }
    this.drawItems();
  }
};

Engine2DCanvas.prototype.drawCars = function(ctx) {
  if(this.gameInstance.cars !== null) {
    ctx.fillStyle = '#FFFFFF';
    for(var i = 0; i < this.gameInstance.cars.length; i++) {
      var c = this.gameInstance.cars[i];
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.r);
      ctx.drawImage(this.carImage, 0, 0, 128, 64, -c.w / 2, -c.h / 2, c.w, c.h);
      ctx.restore();

      var textSize = ctx.measureText(c.playerName);
      var textPad = 25;
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.fillText(c.playerName, -textSize.width / 2, -textPad);
      ctx.restore();
    };
  }
}

var explosionWidth = 56;
var explosionHeight = 51;

Engine2DCanvas.prototype.drawExplosions = function(ctx) {
  if(this.gameInstance.explosions != null) {
    ctx.fillStyle = '#FFFFFF';
    for(var i in this.gameInstance.explosions) {
      var c = this.gameInstance.explosions[i];
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.r);
      var h = explosionHeight;
      var w = explosionWidth;
      ctx.globalAlpha = c.alpha;
      ctx.drawImage(this.explosionImage, 0, 0, w, h, -h / 2, -h / 2, w, h);
      ctx.restore();
    };
  }
}


Engine2DCanvas.prototype.drawProjectiles = function(ctx) {
  // console.log(this.gameInstance.projectiles); 
  if(this.gameInstance.projectiles !== null) {
    for(var i = 0; i < this.gameInstance.projectiles.length; i++) {
      var c = this.gameInstance.projectiles[i];
      switch(c.name) {
      case 'rocket launcher':
        this.drawRocket(c, ctx);
        break;
      default:
        this.drawBullet(c, ctx);
        break;
      }
    };
  }
}

Engine2DCanvas.prototype.drawBullet = function(bullet, ctx) {
  ctx.fillStyle = '#FFFFFF';
  var c = bullet;
  ctx.fillRect(c.x, c.y, c.w, c.h);
}

Engine2DCanvas.prototype.drawRocket = function(rocket, ctx) {

  ctx.fillStyle = '#FFFFFF';
  var c = rocket;
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(c.r);
  ctx.drawImage(this.rocketImage, -c.w / 2, -c.h / 2, 40, 16);
  // ctx.drawImage(this.rocketImage, 0, 0, c.w, c.h);
  ctx.restore();

}

Engine2DCanvas.prototype.drawOutsideWalls = function(ctx) {
  var wThickness = 50;
  var s = this.camera.realWorldSize;
  ctx.fillStyle = this.gameInstance.itemsInMap.outsideWall.pattern;
  // bot
  ctx.fillRect(-wThickness, s.h, s.w + 2 * wThickness, wThickness);
  // top
  ctx.fillRect(-wThickness, -wThickness, s.w + 2 * wThickness, wThickness);
  // left
  ctx.fillRect(-wThickness, 0, wThickness, s.h);
  // right
  ctx.fillRect(s.w, 0, wThickness, s.h);
}

Engine2DCanvas.prototype.drawStaticItems = function(ctx) {
  var that = this;
  if(that.gameInstance.walls != null) {
    _.each(that.gameInstance.walls, function(c) {
      var staticItem = that.gameInstance.itemsInMap[c.name];
      if(!_.isUndefined(staticItem) && !_.isUndefined(staticItem.pattern)) {
        // console.log(c.x, c.)
        if(staticItem.pattern === null) {
          ctx.drawImage(staticItem.img, c.x - c.w / 2, c.y - c.h / 2, c.w, c.h);
        } else {
          ctx.fillStyle = staticItem.pattern;
          ctx.fillRect(c.x - c.w / 2, c.y - c.h / 2, c.w, c.h);
        }
      }
    });
  }
}

Engine2DCanvas.prototype.drawBackground = function(ctx) {
  if(_.isUndefined(this.gameInstance.backgroundPattern)) {
    return;
  }
  var cs = this.camera.getCanvasSize();
  ctx.fillStyle = this.gameInstance.backgroundPattern;
  //this.camera.realWorldSize.w, this.camera.realWorldSize.h
  //ctx.fillRect(0, 0, cs.w, cs.h);
  ctx.fillRect(0, 0, this.camera.realWorldSize.w, this.camera.realWorldSize.h);
  //ctx.fillRect(this.camera.center.x - cs.w / 2, this.camera.center.y - cs.h / 2, cs.w * 2, cs.h * 2);
}

Engine2DCanvas.prototype.drawItems = function() {
  //  var cs = this.camera.getCanvasSize();
  // this.backgroundContext.save();
  // this.backgroundContext.restore();
  // this.ctx.save();
  // this.ctx.restore();
  this.drawBackground(this.ctx);
  this.drawOutsideWalls(this.ctx);
  this.drawStaticItems(this.ctx);

  //this.ctx.drawImage(this.backgroundCanvas, 0, 0, this.camera.realWorldSize.w, this.camera.realWorldSize.h);
  //this.ctx.drawImage(this.backgroundCanvas, 0, 0, cs.w, cs.h, this.camera.center.x - cs.w / 2, this.camera.center.y - cs.h / 2, cs.w * 2, cs.h * 2);
  this.drawCars(this.ctx);
  this.drawExplosions(this.ctx);
  // this.drawBullets(this.ctx);
  // this.drawRockets(this.ctx);
  this.drawProjectiles(this.ctx); 
};

Engine2DCanvas.prototype.tick = function() {
  requestAnimFrame(this.tick.bind(this));
  this.gameInstance.drawEngine.draw();

  this.frames++;
  var now = new Date().getTime();
  if(now - this.timer > 1000) {
    this.timer = now;
    $('#fps').html("fps: " + this.frames);
    this.frames = 0;
  }

}
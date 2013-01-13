function Engine2DCanvas(gameInstance, canvas, canvasID) {
  this.canvas = canvas;
  this.canvasID = canvasID;
  this.gameInstance = gameInstance;
  this.init();
  this.loaded();
  this.timer = new Date().getTime();
  this.frames = 0;
  $('#debug').append('<div id="fps" class="info"/>');
  return this;
}

Engine2DCanvas.prototype.initBackgroundCanvas = function() {
  this.backgroundCanvas = document.createElement('canvas');

  //var cs = this.camera.getCanvasSize();
  //console.log(cs);
  var wSize = this.camera.realWorldSize;

  var scale = 1;
  this.backgroundCanvas.width = wSize.w * scale;
  this.backgroundCanvas.height = wSize.h * scale;

  this.backgroundContext = this.backgroundCanvas.getContext("2d");
  this.backgroundContext.save();
  this.drawBackground(this.backgroundContext);
  this.drawWalls(this.backgroundContext);
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
};

Engine2DCanvas.prototype.loaded = function() {
  $('#loadingtext').html('');
};

Engine2DCanvas.prototype.draw = function() {
  if(this.gameInstance.walls.length > 0) {
    this.camera.ctx.canvas.width = $('#' + this.canvasID).width();
    this.camera.ctx.canvas.height = $('#' + this.canvasID).height();
    this.camera.update(this.gameInstance.mycar);
    this.drawItems();
  }
};

Engine2DCanvas.prototype.drawCars = function(ctx) {
  if(this.gameInstance.cars != null) {
    ctx.fillStyle = '#FFFFFF';
    for(var i = 0; i < this.gameInstance.cars.length; i++) {
      var c = this.gameInstance.cars[i];
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.r);
      ctx.drawImage(this.carImage, 0, 0, 128, 64, -c.w / 2, -c.h / 2, c.w, c.h);
      ctx.restore();
    };
  }
}

Engine2DCanvas.prototype.drawBullets = function(ctx) {
  if(this.gameInstance.bullets !== null) {
    ctx.fillStyle = '#FFFFFF';

    for(var i = 0; i < this.gameInstance.bullets.length; i++) {
      var c = this.gameInstance.bullets[i];
      ctx.fillRect(c.x, c.y, c.w, c.h);
    };
    // ctx.save();
    // ctx.translate(c.x, c.y);
    // ctx.rotate(c.r);
    //ctx.restore();
  }
}

Engine2DCanvas.prototype.drawWalls = function(ctx) {
  var that = this;
  if(that.gameInstance.walls != null) {
    _.each(that.gameInstance.walls, function(c) {
      //console.log(c);
      var staticItem = that.gameInstance.itemsInMap[c.name];
      if(!_.isUndefined(staticItem) && !_.isUndefined(staticItem.pattern)) {
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
  //console.log(this.camera.getCanvasSize(), this.camera.center);
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
  this.drawWalls(this.ctx);

  //this.ctx.drawImage(this.backgroundCanvas, 0, 0, this.camera.realWorldSize.w, this.camera.realWorldSize.h);
  //this.ctx.drawImage(this.backgroundCanvas, 0, 0, cs.w, cs.h, this.camera.center.x - cs.w / 2, this.camera.center.y - cs.h / 2, cs.w * 2, cs.h * 2);
  this.drawCars(this.ctx);
  this.drawBullets(this.ctx);
};

Engine2DCanvas.prototype.tick = function() {
  // console.log(Math.random());
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
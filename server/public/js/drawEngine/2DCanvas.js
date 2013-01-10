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

  this.backgroundCanvas.width = this.camera.realWorldSize.w;
  this.backgroundCanvas.height = this.camera.realWorldSize.h;

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
    _.each(this.gameInstance.cars, function(c) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.r);
      ctx.drawImage(this.carImage, 31, 48, 65, 36, -c.w / 2, -c.h / 2, c.w, c.h);
      ctx.restore();
    }.bind(this));
  }
}

Engine2DCanvas.prototype.drawBullets = function(ctx) {
  if(this.gameInstance.bullets !== null) {
    ctx.fillStyle = '#FFFFFF';
    _.each(this.gameInstance.bullets, function(c) {
      //      console.log(c);
      //    ctx.save();
      // ctx.translate(c.x, c.y);
      // ctx.rotate(c.r);
      ctx.fillRect(c.x, c.y, c.w, c.h);
      //ctx.restore();
    }.bind(this));
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
          ctx.drawImage(staticItem.img, c.position.x - c.size.w / 2, c.position.y - c.size.h / 2, c.size.w, c.size.h);
        } else {
          ctx.fillStyle = staticItem.pattern;
          ctx.fillRect(c.position.x - c.size.w / 2, c.position.y - c.size.h / 2, c.size.w, c.size.h);

        }
      }
    });
  }
}

Engine2DCanvas.prototype.drawBackground = function(ctx) {
  if(_.isUndefined(this.gameInstance.backgroundPattern)) {
    return;
  }
  ctx.fillStyle = this.gameInstance.backgroundPattern;
  ctx.fillRect(0, 0, this.camera.realWorldSize.w, this.camera.realWorldSize.h);
}

Engine2DCanvas.prototype.drawItems = function() {
  this.ctx.drawImage(this.backgroundCanvas, 0, 0, this.camera.realWorldSize.w, this.camera.realWorldSize.h);
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
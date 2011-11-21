function Engine2DCanvas(game, canvas, canvasID) {
  this.canvas = canvas;
  this.canvasID = canvasID;
  this.game = game;
  this.init();
  this.loaded();
  return this;
}

Engine2DCanvas.prototype.init = function() {
  this.ctx = this.canvas.getContext("2d");
  this.canvas.width = $('#' + this.canvasID).width();
  this.canvas.height = $('#' + this.canvasID).height();
  this.camera = new Camera(this.ctx);
  this.camera.setWorldSize(G_game.world.size);
  this.carImage = new Image();
  this.carImage.src = '/sprites/car.png';
  this.wallImage = new Image();
  this.wallImage.src = '/sprites/wall.png';
};

Engine2DCanvas.prototype.loaded = function() {
  $('#loadingtext').html('');
};

Engine2DCanvas.prototype.draw = function() {
  if (this.game.walls.length > 0){
    this.camera.ctx.canvas.width = $('#' + this.canvasID).width();
    this.camera.ctx.canvas.height = $('#' + this.canvasID).height();
    this.camera.update(this.game.mycar);
    this.drawItems();
  }
};

Engine2DCanvas.prototype.drawCars = function() {
  if (this.game.cars != null) {
    _.each(this.game.cars, function(c) {
      this.ctx.save();
      this.ctx.translate(c.x , c.y);
      this.ctx.rotate(c.r);
      this.ctx.drawImage(this.carImage, 31, 48, 65, 36, -c.w / 2, -c.h / 2, c.w, c.h);
      this.ctx.restore();
    }.bind(this));
  }
}

Engine2DCanvas.prototype.drawWalls = function() {
  if (!this.wallImage.complete) return;
  this.wallPattern = this.ctx.createPattern(this.wallImage,'repeat');
  if (this.game.walls != null){
    _.each(this.game.walls, function(c) {
      this.ctx.fillStyle = this.wallPattern;
      this.ctx.fillRect(c.x -c.w / 2 , c.y - c.h / 2, c.w, c.h);
    }.bind(this));
  }
}

Engine2DCanvas.prototype.drawItems = function() {
  this.drawCars();
  this.drawWalls();
};

Engine2DCanvas.prototype.tick = function() {
  requestAnimFrame(this.tick.bind(this));
  G_game.drawEngine.draw();
}

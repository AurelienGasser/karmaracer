var game;

function onSocketLoad(world) {
  // once socket init has been done
  game.drawEngine = new DrawEngine("game-canvas", game);
  game.drawEngine.camera.setWorldSize(world.size);
  game.drawEngine.tick();
}

function Game(){
  this.cars = [];
  this.mycar;
  this.walls = [];
  this.drawEngine;
}

Game.prototype.run = function() {
  if (this.walls.length > 0){
    this.drawEngine.draw();
  }
}

var carImage = new Image();
carImage.src = '/sprites/car.png';

Game.prototype.drawItems = function() {
  var thegame = this;
  if (this.cars != null){
    _.each(this.cars, function(c) {
      thegame.drawEngine.ctx.save();
      thegame.drawEngine.ctx.translate(c.x , c.y);
      thegame.drawEngine.ctx.rotate(c.r);
      thegame.drawEngine.ctx.drawImage(carImage, -c.w / 2, -c.h / 2, c.w, c.h);
      thegame.drawEngine.ctx.restore();
    });
  }
  var i = 0;
  var colors = ['#F00', '#FF0', '#FEE', '#0FF', '#FFF'];
  if (this.walls != null){
    _.each(this.walls, function(c) {
      thegame.drawEngine.camera.ctx.fillStyle = colors[i];
      thegame.drawEngine.camera.ctx.fillRect(c.x -c.w / 2 , c.y - c.h / 2, c.w, c.h);
      i += 1;
    });
  }
};

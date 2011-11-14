var game;

function Game(){
  this.cars = [];
  this.mycar;
  this.walls = [];
  this.drawEngine;
  this.socketManager = new SocketManager(G_serverHost, this, this.onInitReceived);
  document.onkeydown = handleKeyDown;
  document.onkeyup = handleKeyUp;  
}

Game.prototype.onInitReceived = function(err, world) {
  // once socket init has been done
  G_game.drawEngine = DrawEngineFactory(G_game, "game-canvas", G_defaultDrawEngineType);
  G_game.drawEngine.camera.setWorldSize(world.size);

  if (G_MOBILE_DEVICE){
    setInterval(function(){
      if(G_game.socketManager.getConnection() != null){
        if (diff_driveSide <= -maxTurn) diff_driveSide = -maxTurn;
        if (diff_driveSide >= maxTurn) diff_driveSide = maxTurn;
        $('#touch-debug').html('turn: '+  diff_driveSide + ", acc:" + localAcceleration);
        G_game.socketManager.getConnection().emit('accelerate', localAcceleration);
        G_game.socketManager.getConnection().emit('turnCar', diff_driveSide);
      }
      }, 10);
    }

  G_game.drawEngine.tick();
};


var carImage = new Image();
carImage.src = '/sprites/car.png';

Game.prototype.drawItems = function() {
  var thegame = this;
  if (this.cars != null){
    _.each(this.cars, function(c) {
      thegame.drawEngine.ctx.save();
      thegame.drawEngine.ctx.translate(c.x , c.y);
      thegame.drawEngine.ctx.rotate(c.r);
      thegame.drawEngine.ctx.drawImage(carImage, 31, 48, 65, 36, -c.w / 2, -c.h / 2, c.w, c.h);
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

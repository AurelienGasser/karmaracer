var game = null;
var MOBILE_DEVICE = false;

$(function(){
  game = new Game();
  game.SocketManager = new SocketManager(
    karmaracer_server, 
    function(data){
      // once socket init has been done 
      game.drawEngine = new DrawEngine("game-canvas", game);
      game.drawEngine.camera.setWorldSize(data.size);

      if (MOBILE_DEVICE){
        setInterval(function(){
          if(game.SocketManager.nodeserver != null){
            if (diff_driveSide <= -maxTurn) diff_driveSide = -maxTurn;
            if (diff_driveSide >= maxTurn) diff_driveSide = maxTurn;
            $('#touch-debug').html('turn: '+  diff_driveSide + ", acc:" + localAcceleration);
            game.SocketManager.nodeserver.emit('accelerate', localAcceleration);  
            game.SocketManager.nodeserver.emit('turnCar', diff_driveSide);  
          }
        }, 10);    
      }

      game.drawEngine.tick();
    },
    game
  );



});



function Game(){
    this.cars = [];
    this.mycar = null;
    this.walls = [];
    this.drawEngine = null;
}

Game.prototype.run = function() {

  if (this.walls.length > 0){
    this.drawEngine.draw();  
  }

}


var carImage = new Image();
carImage.src = '/sprites/caronly.png';

Game.prototype.drawItems = function() {
  // try
  // {

    var thegame = this;
    if (this.cars != null){
        _.each(this.cars, function(c) {
          thegame.drawEngine.ctx.save();
          thegame.drawEngine.ctx.translate(c.x , c.y);
          thegame.drawEngine.ctx.rotate(c.r);
          //ctx.drawImage(carImage, 44, 32, 36, 66, -c.w / 2, -c.h / 2, c.w, c.h);
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

  // } catch (e) {
  //     console.log('Unable to Load Canvas', e);
  // }  
};



function drawCarsInCanvas(game){


}

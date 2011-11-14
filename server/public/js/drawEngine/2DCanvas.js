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
  this.tick = tick2DCanvas;
};

Engine2DCanvas.prototype.loaded = function() {
  $('#loadingtext').html('');
};

Engine2DCanvas.prototype.draw = function() {
  if (this.game.walls.length > 0){
    this.camera.ctx.canvas.width = $('#' + this.canvasID).width();
    this.camera.ctx.canvas.height = $('#' + this.canvasID).height();
    this.camera.update(this.game.mycar);
    this.game.drawItems();
  }  
};

/**
* Provides requestAnimationFrame in a cross browser way.
*/
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.oRequestAnimationFrame ||
          window.msRequestAnimationFrame ||
          function(callback, element) {
            window.setTimeout(callback, 1000/60);
          };
})();


function tick2DCanvas() {
  requestAnimFrame(tick2DCanvas);
  handleKeys();
  G_game.drawEngine.draw();
  //console.log('tick');
}
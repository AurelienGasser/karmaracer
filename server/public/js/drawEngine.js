//var camera = null;

var carPosY = 1;
var cameraHeight = 0;
var xPos = 0;
var yPos = 0;
var zPos = 0;




function DrawEngine(canvasID, game){
  this.canvas = document.getElementById(canvasID);
  this.canvasID = canvasID;
  this.game = game;
  this.camera = null;

  this.game = game;
  switch(drawEngine){
    case 'WEBGL' :
      if (this.hasWebGL(this.canvas)){
        drawEngine = "WEBGL";
        webGLStart();
        $('#camera-debug').css('display', 'none');
      } else {
        drawEngine = "CANVAS";
        this.init2DCanvas();
      }
    break;
    case 'CANVAS' :
        this.init2DCanvas();    
    break;
  }
}

DrawEngine.prototype.hasWebGL = function() {
  try {
    gl = this.canvas.getContext("experimental-webgl", { antialias: false});
    this.canvas.width = $('#game-canvas').width() - 10;
    this.canvas.height = $('#game-canvas').height();
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    return true;
  }
  catch (e) {
    //console.log('no-gl');
    return false;
  }
};



DrawEngine.prototype.init2DCanvas = function() {
  
  this.ctx = this.canvas.getContext("2d"); 
  this.canvas.width = $('#' + this.canvasID).width();
  this.canvas.height = $('#' + this.canvasID).height();

  document.onkeydown = handleKeyDown;
  document.onkeyup = handleKeyUp;
  $('#loadingtext').html('');
  this.camera = new Camera(this.ctx);
  //this.tick = tick2DCanvas;
  this.tick = tick2DCanvas;
}

DrawEngine.prototype.draw = function(game) {
//  try{
    
    //var canvas = document.getElementById(selector);
    //var ctx = canvas.getContext("2d");
    this.camera.ctx.canvas.width = $('#' + this.canvasID).width();
    this.camera.ctx.canvas.height = $('#' + this.canvasID).height();

    this.camera.update(this.game.mycar);

    this.game.drawItems();

  // }catch(e){
  //   console.log(e);
  //   return;
  // }
};


function tick2DCanvas() {
  requestAnimFrame(tick2DCanvas);
  handleKeys();
  game.run();
  //if (socketManager != null){
    //drawCarsInCanvas(this.game.cars, "game-canvas");  
  //}

}

/**
 * Provides requestAnimationFrame in a cross browser way.
 */
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
           window.setTimeout(callback, 1000/60);
         };
})();






var carPosY = 1;
var cameraHeight = 0;
var xPos = 0;
var yPos = 0;
var zPos = 0;

function DrawEngineFactory(game, canvasID, defaultDrawEngineType){
  var canvas = document.getElementById(canvasID);  
  var drawEngineType = defaultDrawEngineType;

  if ("WEBGL" == this.drawEngineType){
    if (this.hasWebGL(canvas)){
      this.drawEngineType = "WEBGL";
    } else {
      this.drawEngineType = "CANVAS";
    }    
  }
  return this.factory(drawEngineType, canvasID, canvas, game);
}

DrawEngineFactory.prototype.factory = function(drawEngineType, canvasID, canvas, game) {
  switch(this.drawEngineType){
    case 'WEBGL' :
      return new EngineWebGL();
      $('#camera-debug').css('display', 'none');
      break;
    case 'CANVAS' :
      return new Engine2DCanvas(canvas, canvasID, game);
      break;
  }
};

DrawEngineFactory.prototype.hasWebGL = function(canvas) {
  try {
    gl = canvas.getContext("experimental-webgl", { antialias: false});
    canvas.width = $('#game-canvas').width() - 10;
    canvas.height = $('#game-canvas').height();
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    return true;
  }
  catch (e) {
    return false;
  }
};

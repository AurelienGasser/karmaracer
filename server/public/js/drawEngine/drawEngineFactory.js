var carPosY = 1;
var cameraHeight = 0;
var xPos = 0;
var yPos = 0;
var zPos = 0;

function DrawEngineFactory(game, canvasID, defaultDrawEngineType){
  var canvas = document.getElementById(canvasID);  
  var drawEngineType = defaultDrawEngineType;

  var factory = function(game, drawEngineType, canvasID, canvas) {
    switch(drawEngineType){
      case 'WEBGL' :
        return new EngineWebGL();
        $('#camera-debug').css('display', 'none');
        break;
      case 'CANVAS' :
        return new Engine2DCanvas(game, canvas, canvasID);
        break;
    }
  };

  var hasWebGL = function(canvas) {
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

  if ("WEBGL" == drawEngineType){
    if (hasWebGL(canvas)){
      drawEngineType = "WEBGL";
    } else {
      drawEngineType = "CANVAS";
    }    
  }

  return factory(game, drawEngineType, canvasID, canvas);
}


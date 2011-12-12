/**
* Provides requestAnimationFrame in a cross browser way.
*/
window.requestAnimFrame = (function() {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback, element) {
      window.setTimeout(callback, 1000/60);
    }
  );
})();

function DrawEngineFactory(gameInstance, canvasID, defaultDrawEngineType){
  var canvas = document.getElementById(canvasID);
  var drawEngineType = defaultDrawEngineType;
  var gl;

  var factory = function(gameInstance, drawEngineType, canvasID, canvas, gl) {
    switch(drawEngineType){
      case 'WEBGL' :
        return new EngineWebGL(gameInstance, canvas, canvasID, gl);
        $('#camera-debug').css('display', 'none');
        break;
      case 'CANVAS' :
        return new Engine2DCanvas(gameInstance, canvas, canvasID);
        break;
    }
  };

  var getWebGL = function(canvas) {
    try {
      gl = canvas.getContext("experimental-webgl", { antialias: false});
      canvas.width = $('#game-canvas').width() - 10;
      canvas.height = $('#game-canvas').height();
      gl.viewportWidth = canvas.width;
      gl.viewportHeight = canvas.height;
      return gl;
    }
    catch (e) {
      return null;
    }
  };

  if ("WEBGL" == drawEngineType){
    if (gl = getWebGL(canvas)){
      drawEngineType = "WEBGL";
    } else {
      drawEngineType = "CANVAS";
    }
  }

  return factory(gameInstance, drawEngineType, canvasID, canvas, gl);
}


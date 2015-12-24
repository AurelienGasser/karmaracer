(function() {
  "use strict";
  Karma.getDrawEngine = function(isMinimap, canvasId, drawEngineType, items, worldInfo, gScale, gameInstance, connection, callback) {
    var canvas = document.getElementById(canvasId);
    switch (drawEngineType) {
      case 'WEBGL':
        var gl = WebGLUtils.setupWebGL(canvas, { antialias: false });
        return new Karma.EngineWebGL(isMinimap, gameInstance, canvas, canvasId, gl, callback);
      case 'CANVAS':
      default:
        return new Karma.Engine2DCanvas(isMinimap, canvas, canvasId, items, worldInfo, gScale, gameInstance, connection, callback);
    }
  }

}());
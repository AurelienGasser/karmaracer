(function() {
  "use strict";
  Karma.getDrawEngine = function(isMinimap, canvasId, drawEngineType, items, worldInfo, gScale, gameInstance, connection, callback) {
    var canvas = document.getElementById(canvasId);
    switch (drawEngineType) {
      case 'WEBGL':
        return new Karma.EngineWebGL(gameInstance, canvas, canvasId);
      case 'CANVAS':
      default:
        return new Karma.Engine2DCanvas(isMinimap, canvas, canvasId, items, worldInfo, gScale, gameInstance, connection, callback);
    }
  }

}());
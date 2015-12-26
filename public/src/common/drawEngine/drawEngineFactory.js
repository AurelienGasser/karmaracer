(function() {
  "use strict";

  Karma.getDrawEngine = function(isMinimap, canvasId, drawEngineType, items, worldInfo, gScale, gameInstance, connection, callback) {
    var engine;    
    drawEngineType = drawEngineType || 'CANVAS';
    var canvas = document.getElementById(canvasId);
    
    switch (drawEngineType) {
      case 'WEBGL':
        engine = new Karma.EngineWebGL(gameInstance, canvas, canvasId, worldInfo);
        break;
      case 'CANVAS':
        engine = new Karma.Engine2DCanvas(isMinimap, canvas, canvasId, items, worldInfo, gScale, gameInstance, connection);
        break;
      default:
        callback('draw engine not found', null);
        break;
    }
    
    engine.init(function(err) {
      if (err) {
        console.log("Draw engine failed to initialize", isMinimap);
        callback(err);
      } else {
        callback(null, engine);
      }
    });
    
  };

}());
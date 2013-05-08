(function() {
"use strict";


  /**
   * Provides requestAnimationFrame in a cross browser way.
   */
  window.requestAnimFrame = (function() {
    return (
    window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
      window.setTimeout(callback, 1000 / 60);
    });
  })();

  function drawEngineFactory(gameInstance, canvasID, defaultDrawEngineType) {
    var canvas = document.getElementById(canvasID);
    var drawEngineType = defaultDrawEngineType;
    var gl;

    var factory = function(gameInstance, drawEngineType, canvasID, canvas) {
      switch (drawEngineType) {
        case 'CANVAS':
          return new Karma.Engine2DCanvas(gameInstance, canvas, canvasID);
      }
    };
    // 'getWebGL' is defined but never used.
    // var getWebGL = function(canvas) {
    //   try {
    //     gl = canvas.getContext("experimental-webgl", {
    //       antialias: false
    //     });
    //     canvas.width = $('#game-canvas').width() - 10;
    //     canvas.height = $('#game-canvas').height();
    //     gl.viewportWidth = canvas.width;
    //     gl.viewportHeight = canvas.height;
    //     return gl;
    //   } catch (e) {
    //     return null;
    //   }
    // };

    drawEngineType = "CANVAS";

    return factory(gameInstance, drawEngineType, canvasID, canvas, gl);
  }

  Karma.getDrawEngine = drawEngineFactory;

}());
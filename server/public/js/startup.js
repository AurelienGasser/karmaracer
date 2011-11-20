Modernizr.load([
  {
    load: '/js/libs/jquery-1.6.4.min.js',
    complete: function() {
      Modernizr.load([
      {
        test: $("html.touch").length,
        yep: ['/js/mobile.js', '/css/mobile.css'],
        nope: ['css/no-touch.css'],
        complete: function() {
          if (typeof(MobileTerminalHandler) == 'function') {
            var mobileHandler = new MobileTerminalHandler();
            mobileHandler.init();
          }
        }
      },
      {
        test: Modernizr.webgl,
        yep: ['/js/drawEngine/webgl.js', '/js/libs/glMatrix-0.9.5.min.js', '/js/libs/webgl-utils.js'],
        both: '/js/drawEngine/2DCanvas.js',
        complete: function() {
          G_game = new Game();
        }
      }]);
    }
  }
]);




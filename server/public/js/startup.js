Modernizr.load([{
  load: '/js/libs/jquery-1.6.4.min.js',
  complete: function() {
    Modernizr.load([{
      test: $("html.touch").length,
      yep: ['/js/mobile.js', '/css/mobile.css'],
      nope: ['css/no-touch.css'],
      complete: function() {
        gameInstance = new GameInstance();
        if (typeof(MobileTerminalHandler) == 'function') {
          var mobileHandler = new MobileTerminalHandler(gameInstance);
          mobileHandler.init();
        }
      }
    }]);
  }
}]);

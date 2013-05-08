document.ontouchstart = function(e){ 
    e.preventDefault(); 
};

var G_gameInstance;

Modernizr.load([{
  complete: function() {
    Modernizr.load([{
      test: $("html.touch").length,
      yep: ['/dist/mobile.js', '/dist/mobile.css'],
      nope: ['src/mobile/no-touch.css'],
      complete: function() {
        G_gameInstance = new GameInstance();
        if(typeof(MobileTerminalHandler) === 'function') {
          var mobileHandler = new MobileTerminalHandler(G_gameInstance);
          mobileHandler.init();
        }
        var steeringWheel  = new SteeringWheelController(G_gameInstance);
      }
    }]);
  }
}]);


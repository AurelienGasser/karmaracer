document.ontouchstart = function(e){ 
    e.preventDefault(); 
};

var G_gameInstance;

Modernizr.load([{
  load: '/js/libs/jquery-1.6.4.min.js',
  complete: function() {
    Modernizr.load([{
      test: $("html.touch").length,
      yep: ['/js/mobile.js', '/js/mobile_compatibility.js', '/css/mobile.css'],
      nope: ['css/no-touch.css'],
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


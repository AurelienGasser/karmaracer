Modernizr.load([{
  load: '/js/libs/jquery-1.6.4.min.js',
  complete: function() {
    Modernizr.load([{
      test: $("html.touch").length,
      yep: ['/js/mobile.js', '/js/mobile_compatibility.js', '/css/mobile.css'],
      nope: ['css/no-touch.css'],
      complete: function() {
        gameInstance = new GameInstance();
        if(typeof(MobileTerminalHandler) == 'function') {
          var mobileHandler = new MobileTerminalHandler(gameInstance);
          mobileHandler.init();
        }
        googleAnalytics();
      }
    }]);
  }
}]);


function googleAnalytics() {
  // Google Analytics
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-27170619-1']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
  })();

}
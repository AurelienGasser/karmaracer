/*global Modernizr*/

(function() {
  "use strict";
  Modernizr.load([{
    complete: function() {
      Modernizr.load([{
        test: $("html.touch").length,
        yep: ['/dist/mobile.js', '/dist/mobile.css'],
        nope: ['src/mobile/no-touch.css'],
        complete: function() {
          Karma.i18n(G_locale, function() {
            Karma.gameInstance = new Karma.GameInstance();
            if (typeof(Karma.MobileTerminalHandler) === 'function') {
              var mobileHandler = new Karma.MobileTerminalHandler(Karma.gameInstance);
              mobileHandler.init();
            }
            new Karma.SteeringWheelController(Karma.gameInstance);
          });
        }
      }]);
    }
  }]);
}());
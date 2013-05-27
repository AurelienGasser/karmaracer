/*global Modernizr, G_locale*/

(function() {
  "use strict";
  Modernizr.load([{
    complete: function() {
      Modernizr.load([{
        test: $("html.touch").length,
        yep: ['/dist/all_mobile.js', '/dist/all_mobile.css'],
        nope: ['src/no-touch.css'],
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
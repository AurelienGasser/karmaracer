/*global Modernizr, G_locale*/

(function() {
  "use strict";

  Modernizr.load([{
      complete: function() {
        // Karma.Loading.append('start');
        Modernizr.load([{
            test: $("html.touch").length,
            yep: ['/dist/all_mobile.js', '/dist/all_mobile.css'],
            nope: ['/dist/all_desktop.css'],
            complete: function() {
              Karma.Loading.append('i18n');
              Karma.i18n(G_locale, function() {
                Karma.Loading.append($.i18n.prop('loading_game'));
                Karma.gameInstance = new Karma.GameInstance();
                if (typeof(Karma.MobileTerminalHandler) === 'function') {
                  var mobileHandler = new Karma.MobileTerminalHandler(Karma.gameInstance);
                  mobileHandler.init();
                  new Karma.SteeringWheelController(Karma.gameInstance, 'pad', {
                    w: '200px',
                    h: '200px'
                  });
                } else {
                  new Karma.SteeringWheelController(Karma.gameInstance, 'main', {
                    w: '100%',
                    h: '100%'
                  });
                }
              });
            }
          }
        ]);
      }
    }
  ]);
}());
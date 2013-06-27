
(function() {
  "use strict";
  /*global $, G_locale*/
  $(function() {
    Karma.i18n(G_locale, function() {
      Karma.MarketPlace.start();
    });
  });
}());
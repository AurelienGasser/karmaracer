(function() {
  "use strict";
  /*global io */

  var MarketPlace = {};

  MarketPlace.start = function() {
    var host = window.location.hostname;
    var connection = io.connect(host, {
      secure: true
    });
    Karma.TopBar.setTopBar(connection);

    new Karma.CarViewer(connection);

    Karma.Loading.remove();

  };

  Karma.MarketPlace = MarketPlace;


}());
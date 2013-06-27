(function() {
  "use strict";

  var MarketPlace = {};

  MarketPlace.start = function() {
    var host = window.location.hostname;
    var connection = io.connect(host, {
      secure: true
    });
    Karma.TopBar.setTopBar(connection);

    var CarViewer = new Karma.CarViewer(connection);

    

    
    Karma.Loading.remove();

  }

  Karma.MarketPlace = MarketPlace;


}());
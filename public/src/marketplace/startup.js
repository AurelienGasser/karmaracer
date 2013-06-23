(function() {
  $(function() {


    Karma.i18n(G_locale, function() {
      Karma.MarketPlace.start();
    });

  });

  Karma.MarketPlace = {};
  Karma.MarketPlace.start = function() {
    var host = window.location.hostname;
    var connection = io.connect(host, {
      secure: true
    });
    Karma.TopBar.setTopBar(connection);
  }

}());
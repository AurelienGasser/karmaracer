/*global io,GKarmaOptions, G_locale*/
(function(io) {
  "use strict";

  $(function() {
    Karma.i18n(G_locale, function() {
      Karma.Home.start();
    });
  });
  var start = function() {
    Karma.UserVoice();
    var $mapsContainer = $('#mapsContainer');
    var o = [];
    o.push('<h2>', $.i18n.prop('home_clickonmap'), '</h2>');
    o.push('<ul id="maps"></ul>');
    $mapsContainer.append(o.join(''));

    var host = window.location.hostname;
    var connection = io.connect(host, {
      secure: true
    });


    function setPCars() {
      var $objWindow = $(window);
      $('.pcar').each(function() {
        var $bgObj = $(this);
        $bgObj.width($objWindow.width());
        $objWindow.scroll(function() {
          var xPos = ($objWindow.scrollLeft() / $bgObj.data('speed'));
          var coords = xPos + '% 10%';
          // Change the position of background
          $bgObj.css({
            backgroundPosition: coords
          });
        });
      });

      var scroll = function(e, delta) {
        var dir = Karma.Maps.detectDirection();
        var $b = $objWindow;
        if (!KLib.isUndefined(delta)) {
          var m = 30;
          if (delta < 0) {
            m = -m;
          }
          $b.scrollLeft($b.scrollLeft() + m);
        }
      };
      $objWindow.mousewheel(scroll);

    }


    Karma.TopBar.setTopBar(connection);

    connection.emit('get_maps', function(err, maps) {
      Karma.Maps.addMaps(connection, maps);
      setPCars();

      $('#loadingImage').fadeOut();
      $('#victoriesTitle').html($.i18n.prop('home_high_scores_table'));
      connection.emit('get_victories', function(err, victories) {
        outputVictories(victories);

      });
    });

    connection.on('maps_state', function(mapStates) {
      var getName = function(p) {
        return p.name;
      };
      for (var i in mapStates) {
        var m = mapStates[i];
        var players = _.map(m.players, getName).join(', ');
        if (players.length > 0) {
          players = $.i18n.prop('home_playingnow') + ' : ' + players;
        }
        $('#map-' + m.map + ' .players').html(players);
      }
    });

    function outputVictories(victories) {
      var html_start = '<table style="width: 100%"><thead><tr><th>' + $.i18n.prop('home_high_scores_title_rank') + '</th><th>' + $.i18n.prop('home_high_scores_title_car') + '</th><th>' + $.i18n.prop('home_high_scores_title_player') +
        '</th><th>' + $.i18n.prop('home_high_scores_title_victories') + '</th><th>' + $.i18n.prop('home_high_scores_title_highscore') + '</th></tr></thead><tbody>';
      var html_end = '</tbody></table>';
      var html = '';
      for (var i = 0; i < victories.length; i++) {
        html += '<tr><td>' + (i + 1) + '.</td><td class="car"><img src="/sprites/' + victories[i].currentCar + '.png"/></td><td>' + victories[i].playerName + '</td><td>' + victories[i].victories + '</td><td>' + victories[i].highScore + '</td></tr>';
      }
      $('#victories').html(html_start + html + html_end);
    }



    $('#playerNameForm').submit(function() {
      return false;
    });


  };

  Karma.Home = {
    start: start
  };

}(io));
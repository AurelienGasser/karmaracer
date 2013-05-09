/* public/src/home/home.js */
(function(io) {
  "use strict";

  $(function() {
    Karma.Home.start();
  });


  var start = function() {

    Karma.TopBar.setTopBar();



    var host = window.location.hostname;
    var connection = io.connect(host, {
      secure: true
    });

    var mm = new Karma.MiniMap($('body'), 'nmap', connection);

    connection.emit('get_maps', function(err, maps) {
      addMaps(maps);
      $('#loadingImage').fadeOut();
      $('#mapsContainer').fadeIn(2000);
    });

    connection.on('maps_state', function(mapStates) {
      var getName = function(p) {
        return p.name;
      };
      for (var i in mapStates) {
        var m = mapStates[i];
        var players = _.map(m.players, getName).join(', ');
        if (players.length > 0) {
          players = 'Players : ' + players;
        }
        $('#map-' + m.map + ' .players').html(players);
      }
    });


    function registerMaps() {
      $('.mapLink').click(function(e) {
        if (!$('#playerNameForm')[0].checkValidity()) {
          // If the form is invalid, submit it.
          // The form won't actually submit;
          // this will just cause the browser to display the native
          // HTML5 error messages.
          $('#playerNameForm').find(':submit').click();
          e.preventDefault();
          return false;
        }
        Karma.LocalStorage.set('playerName', $('#playerName').val());
        Karma.LocalStorage.set('map', $(this).text());
        return true;
      });
    }

    $('#playerNameForm').submit(function() {
      return false;
    });

    $('#playerName').keyup(function() {
      Karma.LocalStorage.set('playerName', $(this).val());
    });

    function addMaps(maps) {

      var o = [];
      //maps = ['map1'];
      for (var i = 0; i < maps.length; i++) {
        var m = maps[i];
        o.push('<li id="map-', m, '"><a class="mapLink" href="game.' + m + '" >' + m);
        o.push('</a></br><a class="editLink" href="mm.' + m + '" >edit</a></br><span class="players"/></li>');
      }
      $('ul#maps').html(o.join(''));
      registerMaps();
    }
  };

  Karma.Home = {
    start: start
  };

}(io));
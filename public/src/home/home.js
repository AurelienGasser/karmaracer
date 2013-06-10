/*global io*/
(function(io) {
  "use strict";
  /*global G_locale*/

  $(function() {
    Karma.i18n(G_locale, function() {
      Karma.Home.start();
    });
  });



  var start = function() {

    Karma.UserVoice();
    Karma.TopBar.setTopBar();

    var $mapsContainer = $('#mapsContainer');
    var o = [];
    o.push('<h2>', $.i18n.prop('home_clickonmap'), '</h2>');
    o.push('<ul id="maps"></ul>');
    $mapsContainer.append(o.join(''));

    var host = window.location.hostname;
    var connection = io.connect(host, {
      secure: true
    });

    connection.emit('get_maps', function(err, maps) {
      addMaps(maps);
      $('#loadingImage').fadeOut();
      $('#victoriesTitle').html($.i18n.prop('home_high_scores_table'));
      connection.emit('get_victories', function(err, victories) {
        var html_start = '<table style="width: 100%"><thead><tr><th>' + $.i18n.prop('home_high_scores_title_player') +
          '</th><th>' + $.i18n.prop('home_high_scores_title_victories') + '</th></tr></thead><tbody>';
        var html_end = '</tbody></table>';
        var html = '';
        for (var i = 0; i < victories.length; i++) {
          html += '<tr><td>' + victories[i].playerName + '</td><td>' + victories[i].numVictories + '</td></tr>';
        }
        $('#victories').html(html_start + html + html_end);
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
      var $ul = $('ul#maps');
      for (var i = 0; i < maps.length; i++) {
        var o = [];
        var m = maps[i];
        o.push('<li id="map-', m, '">');
        //<a class="editLink" href="mm.' + m + '" >edit</a></br>
        o.push('<div class="info"><span class="players"/></div>');
        var link = 'game.' + m;
        // if (!KLib.isUndefined(parent)){
        // link = 'https://apps.facebook.com/karmaracer_dev/' + link;
        // }
        o.push('<a class="mapLink" href="', link, '" ><div>', m, '</br></div></a>');
        o.push('</li>');
        var $li = $(o.join(''));
        $li.hide();
        $ul.append($li);
        $li.fadeIn(1000);
        new Karma.MiniMap($li.find('a div'), m, connection);
      }
      registerMaps();
    }
  };

  Karma.Home = {
    start: start
  };

}(io));
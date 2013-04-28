var KarmaHome = {};

$(function() {


  KarmaHome.start = function() {
    if (Karma.get('playerName')) {
      $('#playerName').val(Karma.get('playerName'));
      $('#mainContent').show();
    } else {
      $('#playerName').keyup(function() {
        $('#mainContent').css('display', 'block');
      })
    }

    var host = window.location.hostname;
    var connection = io.connect(host);


    connection.emit('get_maps', function(err, maps) {
      addMaps(maps);
    });

    connection.on('maps_state', function(mapStates) {

      for (var i in mapStates) {
        var m = mapStates[i];
        // console.info(m);
        var players = _.map(m.players, function(p) {
          return p.name;
        }).join(', ');
        if (players.length > 0) {
          players = 'Players : ' + players;
        }
        $('#map-' + m.map + ' .players').html(players);
      }

    });


    function registerMaps() {
      $('.mapLink').click(function(e) {
        if (!$('#playerNameForm')[0].checkValidity()) {
          // If the form is invalid, submit it. The form won't actually submit;
          // this will just cause the browser to display the native HTML5 error messages.
          $('#playerNameForm').find(':submit').click()
          e.preventDefault();
          return false;
        }
        Karma.set('playerName', $('#playerName').val());
        Karma.set('map', $(this).text());
        return true;
      });
    }

    $('#playerNameForm').submit(function() {
      return false;
    })

    $('#playerName').keyup(function(e) {
      Karma.set('playerName', $(this).val());
    });

    function addMaps(maps) {


      var o = [];
      //maps = ['map1'];
      for (var i = 0; i < maps.length; i++) {
        var m = maps[i];
        o.push('<li id="map-', m, '"><a class="mapLink" href="game.' + m + '" >' + m + '</a></br><a class="editLink" href="mm.' + m + '" >edit</a></br><span class="players"/></li>');
      };
      $('ul#maps').html(o.join(''));
      registerMaps();
    }


    function createHelp(k, text) {
      return {
        'key': k,
        'text': text
      };
    }

    function getHelps() {
      var helps = [];
      helps.push(createHelp('&#8593;&nbsp;&#8595;', 'accelerate / go backward'));
      helps.push(createHelp('&#8592;&nbsp;&#8594;', 'turn left / right'));
      helps.push(createHelp('&#60;space&#62;', 'shoot'));
      helps.push(createHelp('L/P', 'zoom / unzoom'));
      helps.push(createHelp('B', 'break'));
      helps.push(createHelp('Mouse Click', 'drive'));

      var o = [];
      for (var i = 0; i < helps.length; i++) {
        var h = helps[i];
        o.push('<td class="help_keys">' + h.key + '</td><td class="help_keys_text">' + h.text + '</td>');
      };
      var html = '<table><tr>' + o.join('</tr><tr>') + '</tr></table>';
      return html;


    }
    $('#keys').html(getHelps());


  }

});
(function() {
  "use strict";

  Karma.Maps = function() {

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
        Karma.LocalStorage.set('map', $(this).data('map'));
        return true;
      });
    }

    function addMaps(connection, maps) {
      var $ul = $('ul#maps');
      for (var i = 0; i < maps.length; i++) {
        var o = [];
        var m = maps[i];
        if (m === 'longmap') {
          // don't display
          continue;
        }
        o.push('<li id="map-', m, '">');
        var link = 'game.' + m;
        o.push('<a class="mapLink" href="', link, '" data-map="', m, '"><div class="box"><div class="name">', m, '</div><div class="miniMap"></div>');
        o.push('<div class="info"><div class="players"/></div>');
        o.push('</div></a>');
        o.push('</li>');

        var $li = $(o.join(''));
        $li.hide();
        $ul.append($li);
        $li.fadeIn(1000);
        new Karma.Minimap($li.find('a div.miniMap'), m, connection);
      }
      registerMaps();
    }

    return {
      addMaps: addMaps
    };
  }();

}());
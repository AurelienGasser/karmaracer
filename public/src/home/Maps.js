(function() {
  "use strict";

  Karma.Maps = function() {



    var lastScrollTop = 0,
      lastScrollLeft = 0,
      direction, x = 0, y = 0;

    function detectDirection() {
      x = window.pageXOffset;
      y = window.pageYOffset;
      direction = {
        x: x - lastScrollLeft,
        y: y - lastScrollTop
      };
      lastScrollLeft = x;
      lastScrollTop = y;
      return direction;
    }

    

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

    function addMaps(connection, maps) {
      var $ul = $('ul#maps');
      for (var i = 0; i < maps.length; i++) {
        var o = [];
        var m = maps[i];
        o.push('<li id="map-', m, '">');
        var link = 'game.' + m;
        o.push('<a class="mapLink" href="', link, '" ><div>', m, '</br></div></a>');
        o.push('<div class="info"><span class="players"/></div>');
        o.push('</li>');
        var $li = $(o.join(''));
        $li.hide();
        $ul.append($li);
        $li.fadeIn(1000);
        new Karma.MiniMap($li.find('a div'), m, connection);
      }
      registerMaps();
    }

    return {
      addMaps: addMaps,
      detectDirection: detectDirection
    };
  }();

}());
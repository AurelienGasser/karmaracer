(function() {
  "use strict";


  var winner;

  function setPCars() {
    var $objWindow = $(window);
    $('.pcar').each(function() {
      var $bgObj = $(this);
      $bgObj.width($objWindow.width());


      $objWindow.scroll(function(e) {
        var sr = $objWindow.scrollLeft();
        // var n = (Math.random() * 1e8) % ;
        var n = parseInt($bgObj.attr('data-speed'), 10);
        var max = $(document).width() - $objWindow.width() + n;
        var xPos = (sr / max);

        var i = parseInt($bgObj.attr('data-position'), 10);
        if (i === winner) {

          $('#maps li').each(function(i, li) {
            var $li = $(li);
            var l = $li.position().left;
            var r = l + $li.width();
            var x = xPos * $(document).width();
            if (x < r && x > l) {
              $li.addClass('centerFocus');
            } else {
              $li.removeClass('centerFocus');
            }
          });
        }

        var coords = xPos * 100 + '% 10%';
        // Change the position of background
        $bgObj.css({
          backgroundPosition: coords
        });
      });
    });

    $objWindow.scroll(function(e) {
      if ($objWindow.scrollLeft() === 0) {
        resetSpeed();
      }
    });
  }


  function getSpeed() {
    var speed = parseInt((Math.random() * 1e5) % 500, 10);
    return speed;
  }

  function getWinner(len) {
    return +parseInt((Math.random() * 1e5) % len, 10);
  }

  function resetSpeed() {
    winner = getWinner($('.pcar').length);
    $('.pcar').each(function(i) {
      var $c = $(this);
      var speed = getSpeed();
      if (i === winner) {
        speed = 0;
      }
      $c.attr('data-speed', speed);
    });
  }

  function setCars(connection) {
    connection.emit('getCars', function(err, cars) {
      if (!err) {
        var $b = $('body');
        for (var i = 0; i < cars.length; i++) {
          var c = cars[i];
          var o = [];
          var bottom = i * 48;
          var speed = 0;
          o.push('<div id="p', c.name, '" class="pcar" data-position="', i, '"  style="bottom:', bottom, 'px;background-image: url(\'', c.path, '\');" data-speed="', speed, '"></div>');
          $b.append($(o.join('')));
        }
        setPCars();
        resetSpeed();
      }
    });
  }


  Karma.CarParallax = function() {
    return {
      setCars: setCars,
      resetSpeed: resetSpeed
    };
  }();


}());
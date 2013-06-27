(function() {
  "use strict";

  var CarViewer = function(connection) {
    this.connection = connection;
    this.setup();
    this.getCars();
  };


  CarViewer.prototype.outputCar = function(o, car, user) {
    o.push('<li><span class="name">', car.displayName, '</span><img src="', car.path, '"/>');

    if (!KLib.isUndefined(user) && user.cars.indexOf(car.name) !== -1) {
      if (user.currentCar === car.name) {
        o.push('<div class="bottom option"><span class="info">Currently Used</span></div>');
      } else {
        o.push('<div class="bottom option"><span class="option"><a class="karma-use-car" data-name="', car.name, '">Use</a></span></div>');
      }

    } else {
      o.push('<div class="bottom">');
      o.push('<span class="price">', $.i18n.prop('marketplace_price'), ' : ', car.price, ' Karma</span>');
      if (!KLib.isUndefined(user)) {
        o.push('<span class="option"><a class="marketplace-buy-link" data-name="', car.name, '">', $.i18n.prop('marketplace_buy'), '</a></span>');
      }
      o.push('</div>');
    }
    o.push('</li>');
  };

  CarViewer.prototype.outputCars = function(cars, user) {
    var o = [];
    for (var i = 0; i < cars.length; i++) {
      var c = cars[i];
      this.outputCar(o, c, user);
    };
    this.$ul.html(o.join(''));
    this.setupEvents(cars, user);
  };

  CarViewer.prototype.setupEvents = function(cars, user) {
    var that = this;
    $('.marketplace-buy-link').each(function(i, a) {
      var $a = $(a);
      var carName = $a.attr('data-name');
      $a.on('click.buy', function(e) {
        console.log('buy', carName);
        that.connection.emit('buyCar', {
          carName: carName
        }, function(err, status) {
          console.log(status);
        });
      });
    });

    $('.karma-use-car').each(function(i, a) {
      var $a = $(a);
      var carName = $a.attr('data-name');
      $a.on('click.use', function(e) {
        console.log('use', carName);
        that.connection.emit('useCar', {
          carName: carName
        }, function(err, status) {
          console.log(status);
        });
      });
    });
  };

  CarViewer.prototype.getCars = function(callback) {
    var that = this;
    this.connection.emit('getCars', function(err, cars) {
      if (err) {
        Karma.Log.error(err);
        return;
      }
      console.log(cars);

      if (GKarmaOptions.playerName !== '') {
        that.connection.emit('getMyInfo', function(err, user) {
          that.outputCars(cars, user);
          if (KLib.isFunction(callback)) {
            return callback(null);
          }
        });
      } else {
        that.outputCars(cars);
        if (KLib.isFunction(callback)) {
          return callback(null);
        }
      }
    });
  };
  CarViewer.prototype.setup = function() {
    this.$div = $('<div id="marketplace-cars"></div>');
    this.$ul = $('<ul/>');
    this.$div.append(this.$ul);
    $('body').append(this.$div);
  };

  CarViewer.start = function() {
    var host = window.location.hostname;
    var connection = io.connect(host, {
      secure: true
    });
    Karma.TopBar.setTopBar(connection);



  }

  Karma.CarViewer = CarViewer;


}());
(function() {
  "use strict";

  var CarViewer = function(connection) {
    this.connection = connection;
    this.setup();
    this.getCars();
  };


  CarViewer.prototype.outputCar = function(o, car) {
    o.push('<li><span>', car.displayName, '</span><img src="', car.path, '"/></li>');
  };

  CarViewer.prototype.outputCars = function(cars) {
    var o = [];
    for (var i = 0; i < cars.length; i++) {
      var c = cars[i];
      this.outputCar(o, c);
    };
    this.$ul.html(o.join(''));
  };

  CarViewer.prototype.getCars = function(callback) {
    var that = this;
    this.connection.emit('getCars', function(err, cars) {
      if (err){
        Karma.Log.error(err);
        return;
      }
      console.log(cars);
      that.outputCars(cars);
      if (KLib.isFunction(callback)) {
        return callback(null);
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
var CarManager = function() {
    this.cars = {};

    var that = this;

    function getShared() {
      var cars = [];
      for(var id in that.cars) {
        var car = that.cars[id];
        cars.push(car.getShared());
      }
      return cars;
    };

    function updatePos() {
      for(var id in that.cars) {
        var car = that.cars[id];
        car.updatePos();
      }
    };

    function add(car) {
      that.cars[car.id] = car;
    }

    function remove(car) {
      delete that.cars[car.id];
    }

    return {
      'updatePos': updatePos,
      'getShared': getShared,
      'add': add,
      'shareCars': that.shareCars,
      'remove': remove
    };
  }()

module.exports = CarManager;
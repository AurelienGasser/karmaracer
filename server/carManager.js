var CarManager = function() {
    this.playerCars = {};

    var that = this;

    function getShared() {
      var cars = [];
      for(var id in that.playerCars) {
        var playerCar = that.playerCars[id];
        cars.push(playerCar.getShared());
      }
      return cars;
    };

    function updatePos() {
      for(var id in that.playerCars) {
        var playerCar = that.playerCars[id];
        playerCar.updatePos();
      }
    };

    function add(car) {
      that.playerCars[car.id] = car;
    }

    function remove(car) {
      delete that.playerCars[car.id];
    }

    return {
      'updatePos' : updatePos,
      'getShared' : getShared,
      'add'       : add,
      'shareCars' : that.shareCars,
      'remove'    : remove
    };
}

module.exports = CarManager;
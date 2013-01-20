var CarManager = function() {
    this.playerCars = {};
    this.botCars = {};
}

CarManager.prototype.getShared = function() {
  var cars = [];
  for(var id in this.playerCars) {
    var playerCar = this.playerCars[id];
    cars.push(playerCar.getShared());
  }
  for(var id in this.botCars) {
    var botCar = this.botCars[id];
    cars.push(botCar.getShared());
  }
  return cars;
}

CarManager.prototype.updatePos = function() {
  for(var id in this.playerCars) {
    var playerCar = this.playerCars[id];
    playerCar.updatePos();
  }
}

CarManager.prototype.add = function(playerCar) {
  this.playerCars[playerCar.car.id] = playerCar;
}

CarManager.prototype.remove = function(playerCar) {
  delete this.playerCars[playerCar.car.id];
}

CarManager.prototype.addBot = function(bot) {
  this.botCars[bot.car.id] = bot.car;
}

module.exports = CarManager;
var Snapshot = function(gameServer) {
  this.gameServer = gameServer;
  this.ready = false;
}

Snapshot.prototype.update = function() {
  this.ready = true;
  this.stepNum = this.gameServer.engine.stepNum;
  this.stepTs = this.gameServer.engine.stepTs;
  this.cars = this.gameServer.carManager.getShared();
}

Snapshot.prototype.getSharedSnapshotForPlayer = function(player) {
  var playerCar = player.playerCar;
  var shared = {
    stepNum: this.stepNum,
    stepTs:  this.stepTs,
    cars:    this.cars
  };
  if (playerCar.dead) {
    shared.myCar = null;
  } else {
    for (var i in this.cars) {
      var car = this.cars[i];
      if (car.id === playerCar.id) {
        shared.myCar = car;
        break;
      }
    }
    if (!shared.myCar) {
      console.log('getSharedSnapshotForPlayer: Error retrieving player car');
    }
  }
  return shared;
}

module.exports = Snapshot;
var Snapshot = function(gameServer) {
  this.gameServer = gameServer;
  this.ready = false;
}

Snapshot.prototype.update = function() {
  this.shared = {
    stepNum: this.gameServer.engine.stepNum,
    stepTs:  this.gameServer.engine.stepTs,
    cars:    this.gameServer.carManager.getShared()
  };
  this.ready = true;
}

Snapshot.prototype.getShared = function(playerId) {
  // duplicate
  var cars_shared = {};
  for (var id in this.shared.cars) {
    cars_shared[id] = this.shared.cars[id];
  }
  // exclude playerId
  delete cars_shared[playerId];
  return {
    stepNum:  this.shared.stepNum,
    stepTs:   this.shared.stepTs,
    cars:     cars_shared
  };
}

module.exports = Snapshot;
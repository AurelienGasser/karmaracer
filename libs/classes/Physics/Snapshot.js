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

module.exports = Snapshot;
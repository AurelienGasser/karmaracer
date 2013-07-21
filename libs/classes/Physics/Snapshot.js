var Snapshot = function(gameServer) {
  this.gameServer = gameServer;
  this.ready = false;
  this.ack = {};
}

Snapshot.prototype.update = function() {
  this.stepNum = this.gameServer.engine.stepNum;
  this.stepTs = this.gameServer.engine.stepTs;
  this.cars = this.gameServer.carManager.getShared();
  for (var clientId in this.gameServer.clients) {
    var client = this.gameServer.clients[clientId];
    this.ack[client.id] = client.userCommandManager.ack;
  }
  this.ready = true;
}

Snapshot.prototype.getShared = function(clientId) {
  return {
    stepNum:  this.stepNum,
    stepTs:   this.stepTs,
    cars:     this.cars,
    ack:      this.ack[clientId]
  }
}

module.exports = Snapshot;
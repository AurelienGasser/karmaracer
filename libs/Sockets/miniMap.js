var miniMap = function(gamerServerSocket, client) {
  var that = this;
  client.on('getMiniMap', function(data, callback) {
    var gameServer = gamerServerSocket.mapManager.gameServers[data.name];
    var worldInfo = gameServer.engine.getWorldInfo();
    return callback(null, worldInfo);
  });
}

module.exports = miniMap;
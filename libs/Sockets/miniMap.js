var KLib = require('./../classes/KLib');

var miniMap = function(gamerServerSocket, client) {
  var that = this;
  client.on('getMinimap', function(data, callback) {
    var gameServer = gamerServerSocket.mapManager.gameServers[data.name];
    if (KLib.isUndefined(gameServer)){
      return callback(new Error("map name not available : " + data.name));
    }
    var worldInfo = gameServer.engine.getWorldInfo();
    return callback(null, worldInfo);
  });
}

module.exports = miniMap;
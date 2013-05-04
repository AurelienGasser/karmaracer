var KLib = require('./classes/KLib');
var Player = require('./classes/Player');

var GameServerSocket = function(mapManager) {

  var Car = require('./classes/PhysicsEngine/Car');


  this.homeClientIdCount = 0;
  this.homeClients = {};


  this.mapManager = mapManager;
  var that = this;

  function broadcastMapsState() {
    for (var i in that.homeClients) {
      var client = that.homeClients[i];
      client.emit('maps_state', that.mapManager.getMapsWithPlayers());
    }
  }

  setInterval(broadcastMapsState, 1000);

  this.mapManager.app.io.sockets.on('connection', function(client) {
    // console.info('client connected');


    client.graph = require('fbgraph');
    if (!KLib.isUndefined(client.handshake.session)) {
      client.graph.setAccessToken(client.handshake.session.accessToken);
      that.registerMethods(client);
    }
  });
}


GameServerSocket.prototype.addHomeClient = function(client) {
  client.homeID = this.homeClientIdCount++;
  client.homeClient = true;
  this.homeClients[client.homeID] = client;
}

GameServerSocket.prototype.removeHomeClient = function(client) {
  if (!KLib.isUndefined(client.homeClient) && client.homeClient === true) {
    delete this.homeClients[client.homeID];
  }
}


GameServerSocket.prototype.registerMethods = function(client) {
  var that = this;
  client.keyboard = {};

  // if ()

  client.on('get_maps', function(callback) {
    that.addHomeClient(client);
    return callback(null, Object.keys(that.mapManager.maps));
  });
  client.on('get_items', function(callback) {
    return callback(null, that.mapManager.itemsByName);
  });
  client.on('move_car', function(info) {
    if (!KLib.isUndefined(client.player) && !client.player.playerCar.dead) {
      client.player.playerCar.car.accelerate(info.force);
      client.player.playerCar.car.base.r = info.angle % 2 * Math.PI;
    }
  });

  client.on('get_map', function(mapName, callback) {
    console.info('get map', mapName)
    var map = that.mapManager.maps[mapName];
    if (KLib.isUndefined(map)) {
      return callback({
        'msg': 'map do not exists : ' + mapName
      });
    }
    return callback(null, map);
  });

  client.on('enter_map', function(mapName) {
    console.info('enter in', mapName)
    var gameServer = that.mapManager.gameServers[mapName];
    if (gameServer) {
      var worldInfo = gameServer.engine.getWorldInfo();
      client.emit('init', worldInfo);
      gameServer.clients[client.id] = client;
      client.gameServer = gameServer;
    }
  });

  client.on('init_done', function(userData) {
    console.info('client initialized:', userData.playerName, ' on ', client.gameServer.map.name);
    client.player = new Player(client, userData.playerName);
    client.gameServer.addPlayer(client.player);
  });

  client.on('saveMap', function(map) {
    try {
      var fs = require('fs');
      var path = __dirname + "/public/maps/" + map.name + '.json';
      //reload map
      that.mapManager.createOrUpdateMap(map);
      fs.writeFile(path, JSON.stringify(map), function(err) {
        if (err) {
          console.error(err);
        } else {
          console.info('The map was saved : ', map.name, ' on ', path);
        }
      });
    } catch (e) {
      console.error(e, e.stack);
    }
  });

  client.on('disconnect', function(socket) {
    try {
      that.removeHomeClient(client);
      if (!KLib.isUndefined(client.gameServer)) {
        client.gameServer.removePlayer(client.player);
      }
      console.info('client left:', client.playerName);
    } catch (e) {
      console.error(e, e.stack);
    }
    if (!KLib.isUndefined(client.gameServer)) {
      delete client.gameServer.clients[client.id];
    }
  });

  client.on('drive', function(event, state) {
    try {
      if (state === 'start') {
        client.keyboard[event] = true;
        if (event === 'shoot') {
          if (client.player.playerCar) {
            client.player.playerCar.shootingWithWeapon = client.player.playerCar.weapon.name;
          }
        }
      } else {
        client.keyboard[event] = false;
        if (event === 'shoot') {
          if (client.player.playerCar) {
            client.player.playerCar.shootingWithWeapon = null;
          }
        }
      }
    } catch (e) {
      console.error(e.stack);
    }
  });

  client.on('updatePlayerName', function(name) {
    try {
      client.player.playerCar.updatePlayerName(name);
    } catch (e) {
      console.error(e, e.stack);
    }
  });

  client.on('add bot', function() {
    try {
      client.gameServer.botManager.addBot();
    } catch (e) {
      console.error(e, e.stack);
    }
  });

  client.on('remove bot', function() {
    try {
      client.gameServer.botManager.removeBot();
    } catch (e) {
      console.error(e, e.stack);
    }
  });

  client.on('chat', function(msg) {
    for (var i in client.gameServer.clients) {
      client.gameServer.clients[i].emit('chat_msg', msg);
    }
  });
};

module.exports = GameServerSocket;
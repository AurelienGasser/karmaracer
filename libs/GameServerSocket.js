var KLib = require('./classes/KLib');
var CONFIG = require('./../config');
var Player = require('./classes/Player');
var Car = require('./classes/Physics/Bodies/Car');
var UserCommandManager = require('./UserCommandManager_server');

var GameServerSocket = function(mapManager) {
  this.homeClientIdCount = 0;
  this.clients = [];
  this.homeClients = {};
  this.mapManager = mapManager;

  setInterval(this.broadcastMapsState.bind(this), 1000);

  mapManager.app.io.sockets.on('connection', this.onConnect.bind(this));  
}

GameServerSocket.prototype.onConnect = function(client) {
  // console.info('client connected');
  require('./Sockets/miniMap')(this, client);
  require('./MarketPlace/MarketPlaceSockets')(client);

  client.userCommandManager = new UserCommandManager(client);
  client.graph = require('fbgraph');

  this.registerMethods(client);

  if (!KLib.isUndefined(client.handshake.session)) {
    client.graph.setAccessToken(client.handshake.session.accessToken);
  }
  
  this.clients.push(client);
};

GameServerSocket.prototype.onDisconnect = function(client) {
  return function(socket) {
    try {
      console.info('client left:', client.id);
      this.removeHomeClient(client);
      var idx = this.clients.indexOf(client);
      if (idx != -1) {
        this.clients.splice(idx, 1);
      }
      if (!KLib.isUndefined(client.gameServer)) {
        client.gameServer.removePlayer(client.player);
      }
    } catch (e) {
      console.error(e, e.stack);
    }
    if (!KLib.isUndefined(client.gameServer)) {
      delete client.gameServer.clients[client.id];
    }
  }
};

GameServerSocket.prototype.broadcastMapsState = function() {
  for (var i in this.homeClients) {
    var client = this.homeClients[i];
    client.emit('maps_state', this.mapManager.getMapsWithPlayers());
  }
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
  var user;

  if (client.handshake.session && client.handshake.session.user) {
    user = client.handshake.session.user;
  }

  client.on('ping', function(data, callback) {
    data.serverReceived = Date.now();
    data.serverSent = Date.now();
    callback(null, data);
  });

  client.on('get_maps', function(callback) {
    that.addHomeClient(client);
    return callback(null, Object.keys(that.mapManager.maps));
  });

  client.on('get_victories', function(callback) {
    that.mapManager.getVictories(function(err, victories) {
      if (!err) {
        callback(null, victories);
      }
    });
  });

  client.on('get_items', function(callback) {
    return callback(null, that.mapManager.itemsByName);
  });

  client.on('move_car', function(info) {
    if (!KLib.isUndefined(client.player) && !client.player.playerCar.dead) {
      client.player.playerCar.car.accelerate(info.force);
      client.player.playerCar.car.r = info.angle;
    }
  });

  client.on('getCars', function(callback) {
    var CarController = require('./db/CarController');
    return CarController.getCars(callback);
  });

  client.on('getMyInfo', function(callback) {
    if (user) {
      var UserController = require('./db/UserController');
      UserController.createOrGet(user.fbid, user.playerName, function(err, user) {
        return callback(err, user);
      });
    } else {
      return callback('not authenticated');
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

  client.on('enter_map', function(mapName, playerName) {
    console.info(playerName, 'entered', mapName);
    var gameServer = that.mapManager.gameServers[mapName];
    if (gameServer) {
      client.player = new Player(client, playerName);
      gameServer.addPlayer(client.player);
      gameServer.broadCastGameInfo();
      var worldInfo = gameServer.engine.getWorldInfo();
      worldInfo.gameInfo = gameServer.carManager.getGameInfo();
      var configShared = {
        physicalTicksPerSecond:         CONFIG.physicalTicksPerSecond,
        positionsSocketEmitsPerSecond:  CONFIG.positionsSocketEmitsPerSecond,
        myCarSpeed:                     CONFIG.myCarSpeed,
        myCarTurnSpeed:                 CONFIG.myCarTurnSpeed,
        userCommandsSentPerSecond:      CONFIG.userCommandsSentPerSecond
      };
      var objects = gameServer.getSharedObjectsForPlayer(client.player);
      client.emit('init', {
        worldInfo: worldInfo,
        config: configShared,
        objects: objects
      });
      gameServer.clients[client.id] = client;
      client.gameServer = gameServer;
    }
  });

  client.on('init_done', function() {
    console.info('client initialized:', client.player.playerName, ' on ', client.gameServer.map.name);
  });

  client.on('saveMap', function(map) {
    try {
      var fs = require('fs');
      var path = CONFIG.serverPath + "/public/maps/" + map.name + '.json';
      //reload map
      fs.writeFile(path, JSON.stringify(map), function(err) {
        if (err) {
          console.error(err);
        } else {
          console.info('The map was saved : ', map.name, ' on ', path);
          that.mapManager.createOrUpdateMap(map);
        }
      });
    } catch (e) {
      console.error(e, e.stack);
    }
  });

  client.on('disconnect', this.onDisconnect(client).bind(this));
  
  client.on('user_command', function(userCmd) {
    var now = Date.now();
    try {
      client.userCommandManager.receivedUserCmd(userCmd);
    } catch (e) {
      console.error(e.stack);
    }
  });

  client.on('shoot', function(state) {
    try {
      client.userCommandManager.shoot(state);
    } catch (e) {
      console.error(e.stack);
    }
  });

  client.on('updatePlayerNameTopBar', function(name) {
    try {
      var user = client.handshake.session.user;
      if (!KLib.isUndefined(user)) {
        var UserController = require('./db/UserController');
        user.playerName = name;
        var saveUser = {
          fbid: user.fbid,
          playerName: name
        }
        UserController.save(saveUser);
      }
      if (client.player && client.player.playerCar) {
        client.player.playerCar.updatePlayerName(name);
      }
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
var KLib = require('./classes/KLib');
var CONFIG = require('./../config');
var Player = require('./classes/Player');
var Car = require('./classes/Physics/Bodies/Car');

var GameServerSocket = function(mapManager) {
  this.homeClientIdCount = 0;
  this.homeClients = {};
  this.mapManager = mapManager;
  var that = this;

  setInterval(this.broadcastMapsState.bind(this), 1000);

  this.mapManager.app.io.sockets.on('connection', function(client) {
    // console.info('client connected');
    client.commandIntervals = {};
    // TODOFIX
    that.registerMethods(client);
    client.graph = require('fbgraph');
    if (!KLib.isUndefined(client.handshake.session)) {
      client.graph.setAccessToken(client.handshake.session.accessToken);
    }
  });
}

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

  require('./Sockets/miniMap')(this, client);
  require('./MarketPlace/MarketPlaceSockets')(client);
  var user
  if (client.handshake.session && client.handshake.session.user) {
    user = client.handshake.session.user;
  }

  client.on('ping', function(data, callback) {
    var clientSentTs = data.clientSentTs;
    var serverReceivedTs = Date.now();
    callback(null, {
      clientSentTs:     clientSentTs,
      serverReceivedTs: serverReceivedTs,
    });
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

  client.on('enter_map', function(mapName) {
    console.info('enter in', mapName)
    var gameServer = that.mapManager.gameServers[mapName];
    if (gameServer) {
      var worldInfo = gameServer.engine.getWorldInfo();
      worldInfo.gameInfo = gameServer.carManager.getGameInfo();
      var configShared = {
        physicalTicksPerSecond        : CONFIG.physicalTicksPerSecond,
        positionsSocketEmitsPerSecond : CONFIG.positionsSocketEmitsPerSecond
      };
      client.emit('init', {
        worldInfo: worldInfo,
        config: configShared
      });
      gameServer.clients[client.id] = client;
      client.gameServer = gameServer;
    }
  });

  client.on('init_done', function(userData) {
    console.info('client initialized:', userData.playerName, ' on ', client.gameServer.map.name);
    client.player = new Player(client, userData.playerName);
    client.gameServer.addPlayer(client.player);
    client.gameServer.broadCastGameInfo();
  });

  client.on('saveMap', function(map) {
    try {
      var fs = require('fs');
      var path = CONFIG.serverPath + "/public/maps/" + map.name + '.json';
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
      console.info('client left:', client.id);
      for (var action in client.commandIntervals) {
        stopAction(action);
      }
      that.removeHomeClient(client);
      if (!KLib.isUndefined(client.gameServer)) {
        client.gameServer.removePlayer(client.player);
      }

    } catch (e) {
      console.error(e, e.stack);
    }
    if (!KLib.isUndefined(client.gameServer)) {
      delete client.gameServer.clients[client.id];
    }
  });

  var commandActions = {
    shoot: function(car) {
      car.playerCar.shoot();
    },
    forward: function(car) {
      car.accelerate(0.3);
    },
    backward: function(car) {
      car.accelerate(-0.2);
    },
    left: function(car) {
      var direction = (typeof client.commandIntervals.backward !== 'undefined');
      car.turn(direction);
    },
    right: function(car) {
      var direction = (typeof client.commandIntervals.backward !== 'undefined');
      car.turn(!direction);
    },
  };

  function actionLauncher(action) {
    var cmdFun = commandActions[action];
    return function() {
      if (typeof client.player !== 'undefined' &&
          typeof client.player.playerCar !== 'undefined' &&
          !client.player.playerCar.dead &&
          typeof client.player.playerCar.car !== 'undefined' &&
          typeof client.player.playerCar.gameServer !== 'undefined' &&
          client.player.playerCar.gameServer.doStep) {
            var car = client.player.playerCar.car;
            cmdFun(car);
      } else {
        if (typeof client.commandIntervals[action] !== 'undefined') {
          stopAction(action);
        }
      }
    }
  }

  function stopAction(action) {
    clearInterval(client.commandIntervals[action]);
    delete client.commandIntervals[action];
    if (action == 'shoot' && client.player && client.player.playerCar) {
      client.player.playerCar.weaponShootOff();
    }
  }

  client.on('drive', function(cmd) {
    try {
      if (cmd.state === 'start') {
        if (typeof client.commandIntervals[cmd.action] === 'undefined') {
          var cmdFun = actionLauncher(cmd.action);
          cmdFun();
          client.commandIntervals[cmd.action] = setInterval(cmdFun, 1000 / CONFIG.userActionRepeatsPerSecond);
        } else {
          // do nothing, this action is already schedules to be performed
          // we reach this case because of keyboard repetition
        }
      } else if (cmd.state === 'end') {
        stopAction(cmd.action);
      }
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
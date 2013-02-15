var KLib = require('./classes/KLib');
var GameServerSocket = function(mapManager) {
    var Car = require('./classes/PhysicsEngine/Car');
    var Player = require('./classes/Player');

    this.homeClientIdCount = 0;
    this.homeClients = {};

    function addHomeClient(client){
      client.homeID = that.homeClientIdCount++;
      client.homeClient = true;
      that.homeClients[client.homeID] = client;
    }

    function removeHomeClient(client){
      if (!KLib.isUndefined(client.homeClient) && client.homeClient === true){
        delete that.homeClients[client.homeID];
      }
    }

    this.mapManager = mapManager;
    var that = this;

    function broadcastMapsState(){
      for (var i in that.homeClients){
        var client = that.homeClients[i];
        // console.log('send to', client.homeID);
        client.emit('maps_state', that.mapManager.getMapsWithPlayers());
      }
    }

    setInterval(broadcastMapsState, 1000);

    this.mapManager.app.io.sockets.on('connection', function(client) {
      console.log('client connected');
      client.keyboard = {};

      client.on('get_maps', function(callback) {
        addHomeClient(client);
        return callback(null, Object.keys(that.mapManager.maps));
      });
      client.on('get_items', function(callback) {
        return callback(null, that.mapManager.itemsByName);
      });
      client.on('move_car', function(info) {
        if(!KLib.isUndefined(client.player) && !client.player.playerCar.dead) {
          client.player.playerCar.car.applyForceToBody(info.force);
          client.player.playerCar.car.setAngle(info.angle);
        }
      });

      client.on('get_map', function(mapName, callback) {
        console.log('get map', mapName)
        var map = that.mapManager.maps[mapName];
        if(KLib.isUndefined(map)) {
          return callback({
            'msg': 'map do not exists : ' + mapName
          });
        }
        return callback(null, map);
      });

      client.on('enter_map', function(mapName) {
        console.log('enter in', mapName)
        var gameServer = that.mapManager.gameServers[mapName];
        if (gameServer) {
          var physicsEngine = gameServer.physicsEngine;
          var worldInfo = physicsEngine.getWorldInfo();
          client.emit('init', worldInfo);
          gameServer.clients[client.id] = client;
          client.gameServer = gameServer;
        }
      });

      client.on('init_done', function(userData) {
        console.log('client initialized:', userData.playerName, ' on ', client.gameServer.map.name);
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
            if(err) {
              console.error(err);
            } else {
              console.log('The map was saved : ', map.name, ' on ', path);
            }
          });
        } catch(e) {
          console.error(e, e.stack);
        }
      });

      client.on('disconnect', function(socket) {
        try {
          removeHomeClient(client);
          if(!KLib.isUndefined(client.gameServer)) {
            client.gameServer.removePlayer(client.player);
          }
          console.log('client left:', client.playerName);
        } catch(e) {
          console.log(e, e.stack);
        }
        if(!KLib.isUndefined(client.gameServer)) {
          delete client.gameServer.clients[client.id];
        }
      });

      client.on('drive', function(event, state) {
        try {
          if(state === 'start') {
            client.keyboard[event] = true;
          } else {
            client.keyboard[event] = false;
          }
        } catch(e) {
          console.log(e.stack);
        }
      });

      client.on('updatePlayerName', function(name) {
        try {
          client.player.playerCar.updatePlayerName(name);
        } catch(e) {
          console.log(e, e.stack);
        }
      });

      client.on('add bot', function() {
        try {
          client.gameServer.botManager.addBot();
        } catch(e) {
          console.log(e, e.stack);
        }
      });

      client.on('remove bot', function() {
        try {
          client.gameServer.botManager.removeBot();
        } catch(e) {
          console.log(e, e.stack);
        }
      });

      client.on('chat', function(msg) {
        for(var i in client.gameServer.clients) {
          client.gameServer.clients[i].emit('chat_msg', msg);
        }
      });
    });
  }

module.exports = GameServerSocket;
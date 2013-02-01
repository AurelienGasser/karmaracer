var _ = require('underscore');
var GameServerSocket = function(mapManager) {
    var Car = require('./classes/PhysicsEngine/Car');
    var Player = require('./classes/Player');

    this.mapManager = mapManager;
    var that = this;

    this.mapManager.app.io.sockets.on('connection', function(client) {
      console.log('client connected');
      client.keyboard = {};


      client.on('get_maps', function(callback) {
        return callback(null, Object.keys(that.mapManager.maps));
      });


      client.on('enter_map', function(mapName) {
        console.log('enter in', mapName)
        var gameServer = that.mapManager.gameServers[mapName];
        var physicsEngine = gameServer.physicsEngine;
        var worldInfo = physicsEngine.getWorldInfo();
        client.emit('init', worldInfo);
        gameServer.clients[client.id] = client;
        client.gameServer = gameServer;
      });

      client.on('init_done', function(userData) {
        console.log('client initialized:', userData.playerName, ' on ', client.gameServer.map.name);
        client.player = new Player(client, userData.playerName);
        client.gameServer.addPlayer(client.player);
        client.interval = setInterval(function() {
          var share = {
            myCar: client.player.playerCar.dead ? null : client.player.playerCar.car.getShared(),
            cars: client.gameServer.carManager.getShared(),
            projectiles: client.gameServer.weaponsManager.getGraphicProjectiles()
          };
          client.emit('objects', share);
        }, 1000 / 16);
      });


      client.on('saveMap', function(map) {
        try {
          //console.log('saveMap', map);
          var fs = require('fs');
          var path = "./public/maps/" + map.name + '.json';
          //reload map
          

          that.mapManager.createOrUpdateMap(map);
          

          fs.writeFile(path, JSON.stringify(map), function(err) {
            if(err) {
              console.log(err);
            } else {
              console.log('The map was saved : ', map.name, ' on ', path);
            }
          });

        } catch(e) {
          console.log(e, e.stack);
        }
      });



      client.on('disconnect', function(socket) {
        try {
          if(!_.isUndefined(client.gameServer)) {
            client.gameServer.removePlayer(client.player);
          }
          clearInterval(client.interval);
          console.log('client left:', client.playerName);
        } catch(e) {
          console.log(e, e.stack);
        }
        if(!_.isUndefined(client.gameServer)) {
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

      client.on('chat', function(msg) {
        for(var i in client.gameServer.clients) {
          client.gameServer.clients[i].emit('chat_msg', msg);
        }
      });
    });
  }

module.exports = GameServerSocket;
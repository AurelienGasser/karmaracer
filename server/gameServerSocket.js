var GameServerSocket = function(gameServer) {
    var Car = require('./classes/PhysicsEngine/Car');
    var Player = require('./classes/Player');
    this.gameServer = gameServer;

    var that = this;

    this.gameServer.app.io.sockets.on('connection', function(client) {
      var physicsEngine = that.gameServer.physicsEngine;
      console.log('client connected');
      client.keyboard = {};
      var worldInfo = physicsEngine.getWorldInfo();
      client.emit('init', worldInfo);
      that.gameServer.clients[client.id] = client;

      client.on('init_done', function(userData) {
        console.log('client initialized:', userData.playerName);
        client.player = new Player(client, userData.playerName);
        client.player.initCar(physicsEngine);
        that.gameServer.addCar(client.player.playerCar);
        client.interval = setInterval(function() {
          var share = {
            myCar: client.dead ? null : client.player.car.getShared(),
            cars: that.gameServer.carManager.getShared(),
            bullets: that.gameServer.bulletManager.getGraphicBullets()
          };
          client.emit('objects', share);
        }, 1000 / 16);
      });

      client.on('disconnect', function(socket) {
        try {
          physicsEngine.world.DestroyBody(client.player.car.body);
          that.gameServer.removeCar(client.player.playerCar);
          clearInterval(client.interval);
          console.log('client left:', client.playerName);
        } catch(e) {
          console.log(e);
        }
        delete that.gameServer.clients[client.id];
      });

      client.on('drive', function(events) {
        try {
          for(var event in events) {
            var state = events[event];
            if(state == 'start') {
              client.keyboard[event] = true;
            } else {
              client.keyboard[event] = false;
            }
          }
        } catch(e) {
          console.log(e);
        }
      });


      client.on('updatePlayerName', function(name) {
        try {
          console.log('ipda name', name);
          client.player.car.updatePlayerName(name);
        } catch(e) {
          console.log(e);
        }
      });

      client.on('add bot', function() {
        try {
          that.gameServer.botManager.addBot();
        } catch(e) {
          console.log(e);
        }
      });

      client.on('chat', function(msg) {
        for(var i in that.gameServer.clients) {
          that.gameServer.clients[i].emit('chat_msg', msg);
        }
      });
    });
  }

module.exports = GameServerSocket;
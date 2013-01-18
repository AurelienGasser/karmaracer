var gameServerSocket = function(gameServer) {
    var Car = require('./classes/car');
    this.gameServer = gameServer;

    var that = this;

    this.gameServer.app.io.sockets.on('connection', function(client) {
      var physicsEngine = that.gameServer.physicsEngine;
      console.log('client connected ');
      client.keyboard = {};
      var worldInfo = physicsEngine.getWorldInfo();
      //  console.log(worldInfo);
      client.emit('init', worldInfo);
      that.gameServer.clients[client.id] = client;

      client.on('init_done', function() {
        console.log('client init done');
        client.car = new Car(physicsEngine, client);
        that.gameServer.addCar(client.car);
        client.interval = setInterval(function() {
          var share = {
            myCar: client.dead ? null : client.car.getShared(),
            cars: that.gameServer.cars.getShared(),
            bullets: that.gameServer.bulletManager.getGraphicBullets()
          };
          client.emit('objects', share);
        }, 1000 / 16);
      });

      client.on('disconnect', function(socket) {
        try {
          physicsEngine.world.DestroyBody(client.car.body);
          that.gameServer.removeCar(client.car);
          clearInterval(client.interval);
          console.log('client left');
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
          client.car.updatePlayerName(name);
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

module.exports = gameServerSocket;
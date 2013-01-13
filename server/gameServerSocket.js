var gameServerSocket = function(gameServer) {
    var Car = require('./classes/car');
    this.gameServer = gameServer;

    var that = this;

    this.gameServer.app.io.sockets.on('connection', function(client) {
      console.log('client connected ');
      client.keyboard = {};
      var worldInfo = that.physicsEngine.getWorldInfo();
      //  console.log(worldInfo);
      client.emit('init', worldInfo);
      clients.push(client);

      client.on('init_done', function() {
        console.log('client init done');
        client.car = new Car(physicsEngine);
        that.gameServer.cars.add(client.car);


        client.interval = setInterval(function() {
          var share = {
            myCar: client.car.getShared(),
            cars: that.gameServer.cars.shareCars,
            bullets: that.gameServer.getGraphicBullets()
          };
          //console.log('share', share);
          client.emit('objects', share);
        }, 1000 / 16);
      });

      client.on('disconnect', function(socket) {
        try {
          that.physicsEngine.world.DestroyBody(client.car.body);
          that.gameServer.cars.remove(client.car);
          clearInterval(client.interval);
          console.log('client left');
        } catch(e) {
          console.log(e);
        }
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

      client.on('chat', function(msg) {
        for(var i in clients) {
          clients[i].emit('chat_msg', msg);
        }
      });
    });
  }

module.exports = gameServerSocket;
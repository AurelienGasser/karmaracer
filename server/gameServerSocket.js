var gameServerSocket = function(gameServer) {
    var Car = require('./classes/car');
    this.gameServer = gameServer;

    var that = this;



    var c  = new Car(that.gameServer.physicsEngine);
    that.gameServer.cars.add(c);

    this.gameServer.app.io.sockets.on('connection', function(client) {
      console.log('client connected ');
      client.keyboard = {};
      var worldInfo = that.gameServer.physicsEngine.getWorldInfo();
      //  console.log(worldInfo);
      client.emit('init', worldInfo);
      that.gameServer.clients.push(client);

      client.on('init_done', function() {
        console.log('client init done');

        client.car = new Car(that.gameServer.physicsEngine);
        that.gameServer.cars.add(client.car);


        client.interval = setInterval(function() {

          var a = that.gameServer.cars.shareCars;
          a = a.concat(that.gameServer.physicsEngine.getShareStaticItems());
          var share = {
            myCar: client.car.getShared(),
            //cars: that.gameServer.cars.shareCars,
            cars : a,
            bullets: that.gameServer.getGraphicBullets()
          };
          //console.log('share', share);
          client.emit('objects', share);
        }, 1000 / 16);
      });

      client.on('disconnect', function(socket) {
        try {
          that.gameServer.physicsEngine.world.DestroyBody(client.car.body);
          that.gameServer.cars.remove(client.car);
          clearInterval(client.interval);
          console.log('client left');
        } catch(e) {
          console.log(e);
        }
      });

      client.on('drive', function(events) {
        //console.log(events);
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
          console.log('event error :', e);
        }
      });

      client.on('chat', function(msg) {
        for(var i in that.clients) {
          that.clients[i].emit('chat_msg', msg);
        }
      });
    });
  }

module.exports = gameServerSocket;
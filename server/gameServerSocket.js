var gameServerSocket = function(gameServer) {
    var Car = require('./classes/car');
    this.gameServer = gameServer;

    var that = this;



    var c  = new Car(that.gameServer.physicsEngine);
    that.gameServer.cars.add(c);

    this.gameServer.app.io.sockets.on('connection', function(client) {
      var physicsEngine = that.gameServer.physicsEngine;
      console.log('client connected ');
      client.keyboard = {};
<<<<<<< HEAD
      var worldInfo = that.gameServer.physicsEngine.getWorldInfo();
      //  console.log(worldInfo);
      client.emit('init', worldInfo);
      that.gameServer.clients.push(client);
=======
      var worldInfo = physicsEngine.getWorldInfo();
      //  console.log(worldInfo);
      client.emit('init', worldInfo);
      that.gameServer.clients[client.id] = client;
>>>>>>> fee60abcf7796e18fad765f87c45a6254dc160ad

      client.on('init_done', function(userData) {
        console.log('client init done');
<<<<<<< HEAD

        client.car = new Car(that.gameServer.physicsEngine);
        that.gameServer.cars.add(client.car);


=======
        client.car = new Car(physicsEngine, client, userData.playerName);
        that.gameServer.addCar(client.car);
>>>>>>> fee60abcf7796e18fad765f87c45a6254dc160ad
        client.interval = setInterval(function() {

          var a = that.gameServer.cars.shareCars;
          a = a.concat(that.gameServer.physicsEngine.getShareStaticItems());
          var share = {
<<<<<<< HEAD
            myCar: client.car.getShared(),
            //cars: that.gameServer.cars.shareCars,
            cars : a,
            bullets: that.gameServer.getGraphicBullets()
=======
            myCar: client.dead ? null : client.car.getShared(),
            cars: that.gameServer.cars.getShared(),
            bullets: that.gameServer.bulletManager.getGraphicBullets()
>>>>>>> fee60abcf7796e18fad765f87c45a6254dc160ad
          };
          client.emit('objects', share);
        }, 1000 / 16);
      });

      client.on('disconnect', function(socket) {
        try {
<<<<<<< HEAD
          that.gameServer.physicsEngine.world.DestroyBody(client.car.body);
          that.gameServer.cars.remove(client.car);
=======
          physicsEngine.world.DestroyBody(client.car.body);
          that.gameServer.removeCar(client.car);
>>>>>>> fee60abcf7796e18fad765f87c45a6254dc160ad
          clearInterval(client.interval);
          console.log('client left');
        } catch(e) {
          console.log(e);
        }
        delete that.gameServer.clients[client.id];
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
<<<<<<< HEAD
        for(var i in that.clients) {
          that.clients[i].emit('chat_msg', msg);
=======
        for(var i in that.gameServer.clients) {
          that.gameServer.clients[i].emit('chat_msg', msg);
>>>>>>> fee60abcf7796e18fad765f87c45a6254dc160ad
        }
      });
    });
  }

module.exports = gameServerSocket;
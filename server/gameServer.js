var Car = require('./classes/physicsEngine/car');

var gameServer = function(app) {
    var backbone = require('backbone');
    var _ = require('underscore');
    var fs = require('fs');
    var PhysicsItem = require('./classes/physicsEngine/physicsItem');
    var PhysicsEngine = require('./classes/physicsEngine/physicsEngine');
    // var Car = require('./classes/car');
    // var CarsCollection = require('./classes/cars');
    var BotManager = require('./BotManager');

    // LOAD THE MAP
    // var map = JSON.parse(fs.readFileSync(__dirname + '/public/maps/map1.json'));
    var map = JSON.parse(fs.readFileSync(__dirname + '/public/maps/testarena.json'));

    this.app = app;
    this.physicsEngine = new PhysicsEngine(map, this);



    this.cars = require('./carManager');

    this.clients = [];
    this.botManager = new BotManager(this);

    this.bulletManager = require('./classes/bulletManager');
    this.scoreManager = require('./classes/scoreManager');

    var that = this;


    function play() {
      try {
        that.physicsEngine.step();
        that.cars.updatePos();
        that.bulletManager.updateBullets(that.physicsEngine);
        that.scoreManager.broadcastScores(that);
      } catch(e) {
        console.log("error main interval", e, e.stack);
      }

    }


    // update world
    setInterval(play, 20);


    function handleClientKeyboard() {
      for(var i in that.clients) {
        var client = that.clients[i];
        for(var event in client.keyboard) {
          var state = client.keyboard[event];
          if(state) {
            switch(event) {
            case 'shoot':
              that.bulletManager.add(client.player.car);
              break;
            case 'forward':
              client.player.car.accelerate(1.0)
              break;
            case 'backward':
              client.player.car.accelerate(-1.0)
              break;
            case 'left':
              client.player.car.turn(-3.0)
              break;
            case 'right':
              client.player.car.turn(3.0)
              break;
            }
          }
        }
      }
    }

    setInterval(handleClientKeyboard, 10);
    return this;
  }


gameServer.prototype.broadcast = function(key, data) {
  var that = this;
  for(var i in that.clients) {
    that.clients[i].emit(key, data);
  }
}

gameServer.prototype.broadcastExplosion = function(point) {
  // console.log(position);
  this.broadcast('explosion', {
    x: point.position.x * this.physicsEngine.gScale,
    y: point.position.y * this.physicsEngine.gScale
  });

};


gameServer.prototype.addCar = function(car) {
  this.cars.add(car);
  this.scoreManager.register(car);
}

gameServer.prototype.removeCar = function(car) {
  this.cars.remove(car);
  this.scoreManager.unregister(car);
}

gameServer.prototype.client_die = function(client) {
  if (client.dead) {
    return;
  }
  var that = this;
  client.dead = true;
  this.physicsEngine.world.DestroyBody(client.player.car.body);
  this.removeCar(client.player.car);
  client.emit('dead', null);
  setTimeout(function() {
    client.dead = false;
    client.player.car = new Car(that.physicsEngine, client);
    that.addCar(client.player.car);
  }, 5000);
}

module.exports = gameServer;
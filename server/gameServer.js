var gameServer = function(app) {
    var backbone = require('backbone');
    var _ = require('underscore');
    var fs = require('fs');
    var PhysicsItem = require('./classes/physicsItem');
    var PhysicsEngine = require('./classes/physicsEngine');
    var Car = require('./classes/car');
    var CarsCollection = require('./classes/cars');
    var BotManager = require('./BotManager');

    // LOAD THE MAP
    var map1_path = __dirname + '/public/maps/map1.json';
    var map1String = fs.readFileSync(map1_path);
    var map = JSON.parse(map1String);

    this.app = app;
    this.physicsEngine = new PhysicsEngine(map, this);
    this.cars = new CarsCollection();
    this.bullets = {};
    this.clients = [];
    this.botManager = new BotManager(this);

    this.bulletManager = require('./classes/bulletManager');

    var that = this;


    function play() {
      try {
        that.physicsEngine.step();

        that.cars.updatePos();
        that.bulletManager.updateBullets(that.physicsEngine);

      } catch(e) {
        console.log("error main interval", e);
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
              that.bulletManager.add(client.car);
              break;
            case 'forward':
              client.car.accelerate(1.0)
              break;
            case 'backward':
              client.car.accelerate(-1.0)
              break;
            case 'left':
              client.car.turn(3.0)
              break;
            case 'right':
              client.car.turn(-3.0)
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
}

module.exports = gameServer;
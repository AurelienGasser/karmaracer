var gameServer = function(app) {
  var backbone = require('backbone');
  var _ = require('underscore');
  var fs = require('fs');
  var PhysicsItem = require('./classes/physicsItem');
  var PhysicsEngine = require('./classes/physicsEngine');
  var Bullet = require('./classes/bullet');
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

  var that = this;

  // update all cars positions
  setInterval(function() {
    try {
      that.physicsEngine.step();
      that.cars.updatePos();
      updateBullets();
    } catch(e) {
      console.log("error", e);
    }
  }, 20);

  function updateBullets() {
    var deads = [];
    for(var id in that.bullets) {
      if(that.bullets.hasOwnProperty(id)) {
        var bullet = that.bullets[id];
        //console.log(bullet);
        bullet.accelerate(500);
        bullet.life -= 1;
        if(bullet.life < 0) {
          deads.push(id);
        }
      }
    }
    for(var i = 0; i < deads.length; i++) {
      var id = deads[i];
      that.physicsEngine.world.DestroyBody(that.bullets[id].body);
      delete that.bullets[id];
    };
  }

  function handleClientKeyboard() {
    for(var i in that.clients) {
      var client = that.clients[i];
      for(var event in client.keyboard) {
        var state = client.keyboard[event];
        if(state) {
          switch(event) {
          case 'shoot':
            var b = new Bullet(client.car);
            that.bullets[b.id] = b;
            break;
          case 'forward':
            client.car.accelerate(6.0)
            break;
          case 'backward':
            client.car.accelerate(-6.0)
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


gameServer.prototype.getGraphicBullets = function() {
  var graphics = [];
  for (var id in this.bullets) {
    if (this.bullets.hasOwnProperty(id)) {
      var bullet = this.bullets[id];
      graphics.push(bullet.getShared());
    }
  }
  return graphics;
}

gameServer.prototype.addCar = function(car) {
  this.cars.add(car);
}

module.exports = gameServer;
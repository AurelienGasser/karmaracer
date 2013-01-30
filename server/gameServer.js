var Car = require('./classes/car');

var gameServer = function(app) {
    var backbone = require('backbone');
    var _ = require('underscore');
    var fs = require('fs');
<<<<<<< HEAD


=======
>>>>>>> fee60abcf7796e18fad765f87c45a6254dc160ad
    var PhysicsItem = require('./classes/physicsItem');
    var PhysicsEngine = require('./classes/physicsEngine');
    // var Car = require('./classes/car');
    // var CarsCollection = require('./classes/cars');
    var BotManager = require('./BotManager');

    // LOAD THE MAP
    // var map = JSON.parse(fs.readFileSync(__dirname + '/public/maps/map1.json'));
    var map = JSON.parse(fs.readFileSync(__dirname + '/public/maps/testarena.json'));

    this.app = app;
    this.physicsEngine = new PhysicsEngine(map, this);

<<<<<<< HEAD
    //console.log('engine', this.physicsEngine);

    var Bullet = require('./classes/bullet');
    var Car = require('./classes/car');
    var CarsCollection = require('./classes/cars');

    this.cars = new CarsCollection();
    this.bullets = {};
    this.clients = []
    
    this.gameServerSocket = require('./gameServerSocket')(this);

    var that = this;

        

    // update all cars positions
    setInterval(function() {
=======


    this.cars = require('./carManager');

    this.clients = [];
    this.botManager = new BotManager(this);

    this.bulletManager = require('./classes/bulletManager');
    this.scoreManager = require('./classes/scoreManager');

    var that = this;


    function play() {
>>>>>>> fee60abcf7796e18fad765f87c45a6254dc160ad
      try {
        that.physicsEngine.step();
        that.cars.updatePos();
        that.bulletManager.updateBullets(that.physicsEngine);
        that.scoreManager.broadcastScores(that);
      } catch(e) {
        console.log("error main interval", e, e.stack);
      }
<<<<<<< HEAD
    }, 20);

    function updateBullets() {

      var deads = [];


      for(var id in that.bullets) {
        if(that.bullets.hasOwnProperty(id)) {
          var bullet = that.bullets[id];
          bullet.accelerate(1);
          //bullet.body.m_linearVelocity.x += 1;
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
=======
>>>>>>> fee60abcf7796e18fad765f87c45a6254dc160ad

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
<<<<<<< HEAD
              var b = new Bullet(client.car);
              b.applyForceToBody(0.1);
              that.bullets[b.id] = b;
              break;
            case 'forward':
              client.car.accelerate(6.0);
              break;
            case 'backward':
              client.car.accelerate(-6.0);
              break;
            case 'left':
              client.car.turn(3.0);
              break;
            case 'right':
              client.car.turn(-3.0);
=======
              that.bulletManager.add(client.car);
              break;
            case 'forward':
              client.car.accelerate(1.0)
              break;
            case 'backward':
              client.car.accelerate(-1.0)
              break;
            case 'left':
              client.car.turn(-3.0)
              break;
            case 'right':
              client.car.turn(3.0)
>>>>>>> fee60abcf7796e18fad765f87c45a6254dc160ad
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
  this.physicsEngine.world.DestroyBody(client.car.body);
  this.removeCar(client.car);
  client.emit('dead', null);
  setTimeout(function() {
    client.dead = false;
    client.car = new Car(that.physicsEngine, client);
    that.addCar(client.car);
  }, 5000);
}

module.exports = gameServer;
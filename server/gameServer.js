var Car = require('./classes/PhysicsEngine/Car');

var GameServer = function(app) {
    var backbone = require('backbone');
    var _ = require('underscore');
    var fs = require('fs');
    var PhysicsItem = require('./classes/PhysicsEngine/PhysicsItem');
    var PhysicsEngine = require('./classes/PhysicsEngine/PhysicsEngine');
    var BotManager = require('./BotManager');
    var CarManager = require('./CarManager');

    // LOAD THE MAP
    // var map = JSON.parse(fs.readFileSync(__dirname + '/public/maps/map1.json'));
    var map = JSON.parse(fs.readFileSync(__dirname + '/public/maps/testarena.json'));

    this.app = app;
    this.physicsEngine = new PhysicsEngine(map, this);
    this.carManager = new CarManager();
    this.clients = [];
    this.botManager = new BotManager(this);
    this.bulletManager = require('./classes/BulletManager');
    this.scoreManager = require('./classes/ScoreManager');

    var that = this;

    function play() {
      try {
        that.physicsEngine.step();
        that.carManager.updatePos();
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

GameServer.prototype.broadcast = function(key, data) {
  var that = this;
  for(var i in that.clients) {
    that.clients[i].emit(key, data);
  }
}

GameServer.prototype.broadcastExplosion = function(point) {
  // console.log(position);
  this.broadcast('explosion', {
    x: point.position.x * this.physicsEngine.gScale,
    y: point.position.y * this.physicsEngine.gScale
  });
};

GameServer.prototype.addCar = function(playerCar) {
  this.carManager.add(playerCar);
  this.scoreManager.register(playerCar.car);
}

GameServer.prototype.removeCar = function(playerCar) {
  this.carManager.remove(playerCar);
  this.scoreManager.unregister(playerCar.car);
}

GameServer.prototype.client_die = function(client) {
  if (client.dead) {
    return;
  }
  var that = this;
  client.dead = true;
  this.physicsEngine.world.DestroyBody(client.player.car.body);
  this.removeCar(client.player.playerCar);
  client.emit('dead', null);
  setTimeout(function() {
    client.dead = false;
    client.player.car = new Car(that.physicsEngine, client);
    that.addCar(client.player.playerCar);
  }, 5000);
}

module.exports = GameServer;
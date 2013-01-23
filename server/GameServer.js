var GameServer = function(app) {
    var backbone = require('backbone');
    var _ = require('underscore');
    var fs = require('fs');
    var PhysicsItem = require('./classes/PhysicsEngine/PhysicsItem');
    var PhysicsEngine = require('./classes/PhysicsEngine/PhysicsEngine');
    var BotManager = require('./BotManager');
    var CarManager = require('./CarManager');
    var WeaponsManager = require('./WeaponsManager');

    // LOAD THE MAP
    // var map = JSON.parse(fs.readFileSync(__dirname + '/public/maps/map1.json'));
    var map = JSON.parse(fs.readFileSync(__dirname + '/public/maps/testarena.json'));

    this.app = app;
    this.physicsEngine = new PhysicsEngine(map, this);
    this.carManager = new CarManager(this);
    this.clients = [];
    this.botManager = new BotManager(this);
    this.weaponsManager = new WeaponsManager(this);
    this.scoreManager = require('./classes/ScoreManager');

    var that = this;

    function play() {
      try {
        that.physicsEngine.step();
        that.carManager.updatePos();
        that.weaponsManager.step();
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
              if (client.player && !client.player.playerCar.dead) {
                client.player.playerCar.shoot();
              }
              break;
            case 'forward':
              if (client.player && !client.player.playerCar.dead) {
                client.player.playerCar.car.accelerate(1.0)
              }
              break;
            case 'backward':
              if (client.player && !client.player.playerCar.dead) {
                client.player.playerCar.car.accelerate(-1.0)
              }
              break;
            case 'left':
              if (client.player && !client.player.playerCar.dead) {
                var a = -3.0;
                if (client.keyboard['backward'] === true){
                  a = -a;
                }
                client.player.playerCar.car.turn(a);
              }
              break;
            case 'right':
              if (client.player && !client.player.playerCar.dead) {
                var a = 3.0;
                if (client.keyboard['backward'] === true){
                  a = -a;
                }
                client.player.playerCar.car.turn(a)
                break;
              }
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
  this.broadcast('explosion', {
    x: point.position.x * this.physicsEngine.gScale,
    y: point.position.y * this.physicsEngine.gScale
  });
};

GameServer.prototype.addCar = function(playerCar) {
  this.carManager.add(playerCar);
  this.scoreManager.register(playerCar);
}

GameServer.prototype.addBot = function(bot) {
  this.carManager.addBot(bot);
}

GameServer.prototype.removeCar = function(playerCar) {
  this.carManager.remove(playerCar);
  this.scoreManager.unregister(playerCar);
}

module.exports = GameServer;
var _ = require('underscore');
var fs = require('fs');
var PhysicsItem = require('./classes/PhysicsEngine/PhysicsItem');
var PhysicsEngine = require('./classes/PhysicsEngine/PhysicsEngine');
var BotManager = require('./BotManager');
var CarManager = require('./CarManager');
var WeaponsManager = require('./WeaponsManager');
var ScoreManager = require('./classes/ScoreManager');


var GameServer = function(app, map) {
    // var backbone = require('backbone');
    // LOAD THE MAP
    // var map = JSON.parse(fs.readFileSync(__dirname + '/public/maps/map1.json'));
    //var map = JSON.parse(fs.readFileSync(__dirname + '/public/maps/testarena.json'));
    this.app = app;

    this.initGameServer(map);


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


    function handleClientKeyboard() {
      for(var i in that.players) {
        var player = that.players[i];
        var client = player.client;
        for(var event in client.keyboard) {
          var state = client.keyboard[event];
          if(state) {
            switch(event) {
            case 'shoot':
              if(!player.playerCar.dead) {
                player.playerCar.shoot();
              }
              break;
            case 'forward':
              if(!player.playerCar.dead) {
                player.playerCar.car.accelerate(1.0)
              }
              break;
            case 'backward':
              if(!player.playerCar.dead) {
                player.playerCar.car.accelerate(-1.0)
              }
              break;
            case 'left':
              if(!player.playerCar.dead) {
                var a = -2.0;
                if(client.keyboard['backward'] === true) {
                  a = -a;
                }
                player.playerCar.car.turn(a);
              }
              break;
            case 'right':
              if(!player.playerCar.dead) {
                var a = 2.0;
                if(client.keyboard['backward'] === true) {
                  a = -a;
                }
                player.playerCar.car.turn(a)
                break;
              }
            }
          }
        }
      }
    }

    // update world
    setInterval(play, 20);
    setInterval(handleClientKeyboard, 10);
    return this;
  }

GameServer.prototype.initGameServer = function(map) {
  this.map = map;
  this.physicsEngine = new PhysicsEngine(map, this);
  this.carManager = new CarManager(this);
  this.clients = [];
  this.botManager = new BotManager(this);
  this.weaponsManager = new WeaponsManager(this);
  this.scoreManager = new ScoreManager(this);
  this.players = {};

};

GameServer.prototype.broadcast = function(key, data) {
  for(var i in this.players) {
    this.players[i].client.emit(key, data);
  }
}

GameServer.prototype.broadcastExplosion = function(point) {
  this.broadcast('explosion', {
    x: point.x * this.physicsEngine.gScale,
    y: point.y * this.physicsEngine.gScale
  });
};

GameServer.prototype.gameEnd = function(winnerCar) {
  this.broadcast('game end', {
    winnerName: winnerCar.player.playerName
  });
  var that = this;
  var players = this.players;
  this.players = [];
  for(var i in players) {
    players[i].client.keyboard = {};
  }
  setTimeout(function() {
    for(var i in players) {
      players[i].initCar(this);
    }
    this.players = players;
  }.bind(this), 5000);
}

GameServer.prototype.addPlayer = function(player) {
  player.initCar(this);
  player.id = Math.random();
  this.players[player.id] = player;
}

GameServer.prototype.removePlayer = function(player) {
  if(player.playerCar.car) {
    player.playerCar.car.scheduleForDestroy();
  }
  player.connected = false;
  delete this.players[player.id];
}

module.exports = GameServer;
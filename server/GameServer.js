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

      function reverseA(client, a) {
        if(client.keyboard['backward'] === true) {
          console.log('back');
          a = -a;
        }
        return a;
      }

      var turnAcc = 2.0;

      for(var i in that.players) {
        var player = that.players[i];
        var client = player.client;
        if(player.playerCar.dead) {
          continue;
        }
        var car = player.playerCar.car;
        for(var event in client.keyboard) {
          var state = client.keyboard[event];
          if(state) {
            switch(event) {
            case 'break':
              car.reduceVelocityOnlyOfBody(2);
              break;
            case 'shoot':
              player.playerCar.shoot();
              break;
            case 'forward':

              car.accelerate(1.0);

              break;
            case 'backward':
              car.accelerate(-1.0);
              break;
            case 'left':
              // console.log('left');
              // car.applyForceToBody({
              //   x: -1.0,
              //   y: 1.0
              // });
              // car.addAngle(-Math.PI / 4);
              var a = -turnAcc;
              car.turn(reverseA(client, a));
              break;
            case 'right':
              var a = turnAcc;
              car.turn(reverseA(client, a));
              break;
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
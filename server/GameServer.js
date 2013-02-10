var _ = require('underscore');
var fs = require('fs');
var PhysicsItem = require('./classes/PhysicsEngine/PhysicsItem');
var PhysicsEngine = require('./classes/PhysicsEngine/PhysicsEngine');
var BotManager = require('./BotManager');
var CarManager = require('./CarManager');
var WeaponsManager = require('./WeaponsManager');


var GameServer = function(app, map) {
    this.app = app;
    this.initGameServer(map);
    return this;
  }

GameServer.prototype.handleClientKeyboard = function() {
  var that = this;

  function reverseA(client, a) {
    if(client.keyboard['backward'] === true) {
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

};


GameServer.prototype.play = function() {
  var that = this;
  try {
    that.physicsEngine.step();
    that.carManager.updatePos();
    that.weaponsManager.step();
    that.botManager.tick();

    that.sendPositionsToPlayers();
    // that.scoreManager.broadcastScores(that);
  } catch(e) {
    console.log("error main interval", e, e.stack);
  }
}


GameServer.prototype.initGameServer = function(map) {
  this.map = map;
  this.physicsEngine = new PhysicsEngine(map, this);
  this.carManager = new CarManager(this);
  this.clients = [];
  this.botManager = new BotManager(this);
  this.weaponsManager = new WeaponsManager(this);
  this.players = {};


  // update world
  setInterval(this.play.bind(this), 1000 / 16);
  setInterval(this.handleClientKeyboard.bind(this), 1000 / 100);
};

GameServer.prototype.getPlayersForShare = function() {
  var players = [];
  for(var i in this.players) {
    var p = this.players[i];
    var pShare = {
      'name': p.playerName
    };
    players.push(pShare);
  }
  return players;
};


GameServer.prototype.sendPositionsToPlayers = function() {
  var cars = this.carManager.getShared();
  var projectiles = this.weaponsManager.getGraphicProjectiles();
  for(var i in this.players) {
    var p = this.players[i];
    var myCar = p.playerCar.dead ? null : p.playerCar.car.getShared();
    var share = {
      myCar: myCar,
      cars: cars,
      projectiles: projectiles
    };
    p.client.emit('objects', share);
  }
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
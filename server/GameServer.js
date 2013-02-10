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

  function reverseTurning(client, turningRight) {
    if (client.keyboard['backward'] === true) {
      return !turningRight;
    }
    return turningRight;
  }
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
          car.reduceAngularVelocity(0.3);
          break;
        case 'shoot':
          player.playerCar.shoot();
          break;
        case 'forward':
          car.accelerate(0.2);
          break;
        case 'backward':
          car.accelerate(-0.2);
          break;
        case 'left':
          car.turn(reverseTurning(client, false));
          break;
        case 'right':
          car.turn(reverseTurning(client, true));
          break;
        }
      }
    }
    if (!client.keyboard.left && !client.keyboard.right) {
      car.currentAngularAcceleration = 0;
    }
  }

};


GameServer.prototype.step = function() {
  var that = this;
  var ts = new Date();
  var tolerance = 2;
  if (this.tickTs && ts - this.tickTs > this.tickInterval * tolerance) {
    console.log('Warning: main step takes too long...')
  }
  this.tickTs = ts;
  try {
    that.physicsEngine.step();
    if (this.tickCounter % 4 == 0) {
      that.carManager.updatePos();
      that.weaponsManager.step();
    }
    if (this.tickCounter % 30 == 0) {
      that.botManager.tick();
    }
    // that.scoreManager.broadcastScores(that);
  } catch(e) {
    console.log("error main interval", e, e.stack);
  }
  this.tickCounter = (this.tickCounter + 1) % this.ticksPerSecond
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
  this.ticksPerSecond = 60;
  this.tickInterval = 1000 / this.ticksPerSecond;
  this.tickCounter = 0;
  setInterval(this.step.bind(this), this.tickInterval);
  setInterval(this.handleClientKeyboard.bind(this), 1000 / 100);
  setInterval(this.sendPositionsToPlayers.bind(this), 1000 / 16);
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
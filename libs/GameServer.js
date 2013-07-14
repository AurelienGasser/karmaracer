var KLib = require('./classes/KLib');
var fs = require('fs');
var config = require('./../config');
var BotManager = require('./BotManager');
var CarManager = require('./CarManager');
var WeaponsManager = require('./WeaponsManager');
var MemLeakLog = require('./MemLeakLog');
var GameServer_step = require('./GameServer_step');
var Engine = require('./classes/Physics/Engine');

var GameServer = function(app, map, mapManager) {
  this.app = app;
  this.mapManager = mapManager;
  this.initGameServer(map);
  return this;
}


GameServer.prototype.reloadMap = function(map) {
  this.map = map;
  this.engine.size = {
    'w': map.size.w,
    'h': map.size.h
  };
  this.engine.map = map;
  this.engine.staticItemTypes = {};
  for (var i = 0; i < this.engine.staticBodies.length; i++) {
    var sb = this.engine.staticBodies[i];
    delete this.engine.bodies[sb.id];
  };
  this.engine.loadStaticItems();
};

GameServer.prototype.initGameServer = function(map) {
  this.map = map;
  this.snapshot = undefined;

  this.engine = new Engine({
    'w': map.size.w,
    'h': map.size.h
  }, map);

  this.carManager = new CarManager(this);
  this.botManager = new BotManager(this);
  this.weaponsManager = new WeaponsManager(this);
  this.clients = [];
  this.players = {};
  this.initStep();

  // memory
  this.mem = new MemLeakLog();
  this.mem.enable = false;
  this.mem.register('b2Body');
  if (config.performanceTest) {
    require('./GameServerPerfTest')(this);
  } else {
    this.mem.save();
    this.tryStepAfterDelay(0);
    setInterval(this.handleClientKeyboard.bind(this), 1000 / 100);
  }
  this.postInit();
};

GameServer.prototype.postInit = function() {
  // post init: add additional bots, etc..
}

function reverseTurning(client, turningRight) {
  if (client.keyboard['backward'] === true) {
    return !turningRight;
  }
  return turningRight;
}

GameServer.prototype.handleClientKeyboard = function() {
  var that = this;
  try {
    if (this.doStep === false) {
      return;
    }
    for(var i in that.players) {
      var player = that.players[i];
      var client = player.client;
      if (player.playerCar.dead) {
        continue;
      }
      var car = player.playerCar.car;
      for (var event in client.keyboard) {
        var state = client.keyboard[event];

        if(state) {
          switch(event) {
          case 'break':
            // todo ?
            break;
          case 'shoot':
            player.playerCar.shoot();
            break;
          case 'forward':
            car.accelerate(0.3);
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
        if (config.stepByStepMode === true) {
          delete client.keyboard[event];
        }
      }
      if (!client.keyboard.left && !client.keyboard.right) {
        car.currentAngularAcceleration = 0;
      }
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

GameServer.prototype.getPlayersForShare = function() {
  var players = [];
  for (var i in this.players) {
    var p = this.players[i];
    var pShare = {
      'name': p.playerName
    };
    players.push(pShare);
  }
  return players;
};

GameServer.prototype.broadCastGameInfo = function() {
  var gameInfo = this.carManager.getGameInfo();
  this.broadcast('gameInfo', gameInfo);
};

GameServer.prototype.sendPositionsToPlayers = function() {
  if (!this.snapshot.ready) {
    return;
  }
  var projectiles = this.weaponsManager.getGraphicProjectiles();
  for (var i in this.players) {
    var p = this.players[i];
    var playerCar = p.playerCar;
    var myCar;
    var allCurrentCars = this.carManager.getShared();
    if (playerCar.dead) {
      myCar = null;
    } else {
      for (var i in allCurrentCars) {
        var car = allCurrentCars[i];
        if (car.id === playerCar.id) {
          myCar = car;
          break;
        }
      }
      if (!myCar) {
        console.error('sendPositionsToPlayers: Error retrieving player car');
      }
    }
    var share = {
      snapshot:       this.snapshot.shared,
      myCar:          myCar,
      projectiles:    projectiles,
      collisionPoints:p.playerCar.weapon ? p.playerCar.weapon.collisionPoints : null,
    }
    p.client.emit('objects', share);
  }
};

GameServer.prototype.broadcast = function(key, data) {
  for (var i in this.players) {
    this.players[i].client.emit(key, data);
  }
}

GameServer.prototype.broadcastExplosion = function(point) {
  this.broadcast('explosion', {
    x: point.x * this.engine.gScale,
    y: point.y * this.engine.gScale
  });
};

function handleError(err) {
  console.error("caught handle", err);
}

GameServer.prototype.savePlayersInDb = function() {
  this.carManager.savePlayersInDb();
};

GameServer.prototype.gameEnd = function(winnerCar) {
  this.broadcast('game end', {
    winnerName: winnerCar.playerName
  });
  winnerCar.addVictory();
  this.savePlayersInDb();
  this.resetGame();
  this.doStep = false;
  var that = this;
  setTimeout(function() {
    that.doStep = true;
  }.bind(this), 5000);
}

GameServer.prototype.resetGame = function(first_argument) {
  var players = this.players;
  for (var i in players) {
    players[i].client.keyboard = {};
  }
  for (var i in players) {
    players[i].initCar(this);
  }
  this.botManager.resetBots();
};

GameServer.prototype.addPlayer = function(player) {
  player.initCar(this);
  player.id = player.playerCar.id;
  this.players[player.id] = player;
}

GameServer.prototype.removePlayer = function(player) {
  if (player.playerCar.car) {
    player.playerCar.car.scheduleForDestroy();
  }
  player.connected = false;
  delete this.players[player.id];
}

KLib.extendPrototype(GameServer, GameServer_step);
module.exports = GameServer;
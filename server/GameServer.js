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
    if(client.keyboard['backward'] === true) {
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
    if(!client.keyboard.left && !client.keyboard.right) {
      car.currentAngularAcceleration = 0;
    }
  }

};


GameServer.prototype.step = function() {

  function registerDateDiff(timer, name, start) {
    var now = new Date();
    timer[name] = now - start;
    return now;
  }

  var maxDiff = this.tickInterval;
  if(this.timer.lastDiff > maxDiff) {
    console.log('Warning: main step takes too long...', this.map.name, this.timer.lastDiff + 'ms');//, this.timer, 'max:', maxDiff);
  } else {
    // console.log("engine time", this.timer.lastDiff);
  }

  timer = this.timer;
  timer.begin = new Date();

  var that = this;


  // var ts = new Date();
  // var tolerance = 2;
  // if(this.tickTs && ts - this.tickTs > maxDiff) {
  // }
  // this.tickTs = ts;
  try {
    var start = new Date();
    that.physicsEngine.step();
    start = registerDateDiff(timer, 'physics', start);
    if(this.tickCounter % 2 === 0) {
      start = new Date();
      that.carManager.updatePos();
      start = registerDateDiff(timer, 'carManager', start);
      that.weaponsManager.step();
      start = registerDateDiff(timer, 'weaponsManager', start);
    }
    if(this.tickCounter % 4 === 0) {
      that.sendPositionsToPlayers();
      start = registerDateDiff(timer, 'sendPositions', start);
    }
    if(this.tickCounter % 30 === 0) {
      start = new Date();
      that.botManager.tick();
      start = registerDateDiff(timer, 'botManager', start);
    }
  } catch(e) {
    console.log("error main interval", e, e.stack);
  }
  this.tickCounter = (this.tickCounter + 1) % this.ticksPerSecond
  registerDateDiff(timer, 'lastDiff', timer.begin);
  // console.log(timer.lastDiff);
  this.timer = timer;
}


GameServer.prototype.initGameServer = function(map) {
  this.map = map;
  this.physicsEngine = new PhysicsEngine(map, this);
  this.carManager = new CarManager(this);
  this.botManager = new BotManager(this);
  this.weaponsManager = new WeaponsManager(this);
  this.clients = [];
  this.players = {};
  this.timer = {};

  // update world
  this.ticksPerSecond = 60;
  this.tickInterval = 1000 / this.ticksPerSecond;
  this.tickCounter = 0;
  this.tickTs = new Date();
  setInterval(this.step.bind(this), this.tickInterval);
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
    that.botManager.resetBots();

    that.players = players;
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
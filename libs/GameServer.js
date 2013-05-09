var KLib = require('./classes/KLib');
var fs = require('fs');
var config = require('./../config');
var BotManager = require('./BotManager');
var CarManager = require('./CarManager');
var WeaponsManager = require('./WeaponsManager');
var MemLeakLog = require('./MemLeakLog');

var GameServer = function(app, map) {
    this.app = app;
    this.initGameServer(map);
    return this;
  }

GameServer.prototype.initGameServer = function(map) {
  this.map = map;

  var KarmaEngine = require('./classes/PhysicsEngine/PhysicsEngine');
  this.engine = new KarmaEngine({
    'w': map.size.w,
    'h': map.size.h
  }, map);

  this.carManager = new CarManager(this);
  this.botManager = new BotManager(this);
  this.weaponsManager = new WeaponsManager(this);
  this.clients = [];
  this.players = {};
  this.timer = {};
  this.lastStepTooLong = false;
  this.doStep = true;
  // update world
  this.ticksPerSecond = 60;
  this.tickInterval = 16; //1000 / this.ticksPerSecond;
  this.minTickInterval = this.tickInterval
  this.tickCounter = 0;
  this.tickTs = new Date();



  this.mem = new MemLeakLog();
  this.mem.enable = false;

  // this.mem.register('b2Vec2');
  this.mem.register('b2Body');

  // this.mem.register('Bullet');
  // setInterval(this.step.bind(this), this.tickInterval);
  var that = this;

  function stepGame(time) {
    setTimeout(function() {
      that.mem.diff();
      that.mem.save();
      if(that.doStep) {
        that.step();
      }
      stepGame(that.tickInterval);
      that.mem.diff();
      that.mem.save();
      that.mem.log();
      that.tickInterval += ((that.lastStepTooLong) ? 1 : -1);
      if(that.tickInterval < that.minTickInterval) {
        that.tickInterval = that.minTickInterval;
      }
    }, time);
  };
  that.mem.save();
  stepGame(0);
  setInterval(this.handleClientKeyboard.bind(this), 1000 / 100);
  this.postInit();
};

GameServer.prototype.postInit = function() {
  // post init: add bots, etc..
}

GameServer.prototype.handleClientKeyboard = function() {
  var that = this;

  try {
    if(this.doStep === false) {
      return;
    }

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
            // car.reduceAngularVelocity(0.3);
            // car.reduceLinearVelocity(0.4);
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
      if(!client.keyboard.left && !client.keyboard.right) {
        car.currentAngularAcceleration = 0;
      }
    }
  } catch(err) {
    console.error(err);
    throw err;
  }

};


GameServer.prototype.step = function() {
  if(this.doStep === false) {
    return;
  }

  function registerDateDiff(timer, name, start) {
    var now = new Date();
    timer[name] = now - start;
    return now;
  }

  var maxDiff = this.tickInterval;
  if(this.timer.lastDiff > maxDiff) {
    // console.error('Warning: main step takes too long...', this.map.name, this.timer.lastDiff + 'ms, max ', this.tickInterval, 'min ', this.minTickInterval); //, this.timer, 'max:', maxDiff);
    this.lastStepTooLong = true;
  } else {
    this.lastStepTooLong = false;
    // console.info("engine time", this.timer.lastDiff);
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
    start = registerDateDiff(timer, 'physics', start);
    if(this.tickCounter % 2 === 0) {
      start = new Date();
      that.weaponsManager.step();
      start = registerDateDiff(timer, 'weaponsManager', start);
      that.engine.step();
      start = registerDateDiff(timer, 'Physics', start);
    }
    if(this.tickCounter % 4 === 0) {
      that.sendPositionsToPlayers();
      start = registerDateDiff(timer, 'sendPositions', start);
    }
    if(this.tickCounter % 4 === 0) {
      start = new Date();
      that.botManager.tick();
      start = registerDateDiff(timer, 'botManager', start);
    }
  } catch(e) {
    console.error("error main interval", e, e.stack);
    throw e;
  }
  this.tickCounter = (this.tickCounter + 1) % this.ticksPerSecond
  registerDateDiff(timer, 'lastDiff', timer.begin);
  this.timer = timer;
}


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
    var myCar = p.playerCar.dead ? null : p.playerCar.getShared();
    var share = {
      myCar: myCar,
      cars: cars,
      projectiles: projectiles,
      collisionPoints: p.playerCar.weapon ? p.playerCar.weapon.collisionPoints : null
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
    x: point.x * this.engine.gScale,
    y: point.y * this.engine.gScale
  });
};

function handleError(err) {
  console.error("caught handle", err);
}

GameServer.prototype.updateHighScores = function() {
  this.carManager.updateHighScores();
};

GameServer.prototype.gameEnd = function(winnerCar) {
  this.broadcast('game end', {
    winnerName: winnerCar.player.playerName
  });
  this.updateHighScores();
  this.resetGame();
  this.doStep = false;
  var that = this;
  setTimeout(function() {
    that.doStep = true;
  }.bind(this), 5000);
}

GameServer.prototype.resetGame = function(first_argument) {
  var players = this.players;

  for(var i in players) {
    players[i].client.keyboard = {};
  }
  for(var i in players) {
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
  if(player.playerCar.car) {
    player.playerCar.car.scheduleForDestroy();
  }
  player.connected = false;
  delete this.players[player.id];
}

module.exports = GameServer;
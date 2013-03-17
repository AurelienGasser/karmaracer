var KLib = require('./classes/KLib');
var fs = require('fs');
// var PhysicsItem = require('./classes/PhysicsEngine/PhysicsItem');
// var PhysicsEngine = require('./classes/PhysicsEngine/PhysicsEngine');
var BotManager = require('./BotManager');
var CarManager = require('./CarManager');
var WeaponsManager = require('./WeaponsManager');
var MemLeakLog = require('./MemLeakLog');
var memwatch = require('memwatch');

// memwatch.on('stats', function(stats) {
//   console.log('MEM STATS', stats);
// });

// memwatch.on('leak', function(info) {
//   console.log('MEM LEAK', info);
// });

var GameServer = function(app, map) {
    this.app = app;
    this.initGameServer(map);
    return this;
  }

GameServer.prototype.initGameServer = function(map) {
  this.map = map;

  var KarmaEngine = require('./classes/PhysicsEngine/KarmaPhysicsEngine');
  this.kengine = new KarmaEngine({
    'w': 2000,
    'h': 2000
  }, map);

  // this.physicsEngine = new PhysicsEngine(map, this);
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
};

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
            car.reduceAngularVelocity(0.3);
            car.reduceLinearVelocity(0.4);
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
      }
      if(!client.keyboard.left && !client.keyboard.right) {
        car.currentAngularAcceleration = 0;
      }
    }
  } catch(err) {
    console.error(err);
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
    // console.log('Warning: main step takes too long...', this.map.name, this.timer.lastDiff + 'ms, max ', this.tickInterval, 'min ', this.minTickInterval); //, this.timer, 'max:', maxDiff);
    this.lastStepTooLong = true;
  } else {
    this.lastStepTooLong = false;
    // console.log(this.tickInterval);
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

    // console.log('step', this.tickCounter);
    var start = new Date();
    // that.physicsEngine.step();
    start = registerDateDiff(timer, 'physics', start);
    if(this.tickCounter % 2 === 0) {
      start = new Date();
      that.carManager.updatePos();
      start = registerDateDiff(timer, 'carManager', start);
      that.weaponsManager.step();
      start = registerDateDiff(timer, 'weaponsManager', start);
      that.kengine.step();
    }
    if(this.tickCounter % 4 === 0) {
      // console.log('send');
      that.sendPositionsToPlayers();
      start = registerDateDiff(timer, 'sendPositions', start);
    }
    if(this.tickCounter % 4 === 0) {
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
    // console.log(this.players);
  var cars = this.carManager.getShared();
  // cars = cars.concat(this.kengine.getShared());
  var bodies = this.kengine.getShared();

  var projectiles = this.weaponsManager.getGraphicProjectiles();
  for(var i in this.players) {
    var p = this.players[i];
    var myCar = p.playerCar.dead ? null : p.playerCar.car.getShared();
    var share = {
      myCar: myCar,
      cars: cars,
      projectiles: projectiles,
      bodies : bodies
    };
    // console.log(share);
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

function handleError(err) {
  console.error("caught handle", err);
}

GameServer.prototype.gameEnd = function(winnerCar) {
  console.log('END OF GAME');
  this.broadcast('game end', {
    winnerName: winnerCar.player.playerName
  });
  this.resetGame();
  this.doStep = false;
  // throw new Error("end of game");
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
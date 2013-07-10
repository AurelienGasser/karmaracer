var fs = require('fs');
var KLib = require('./classes/KLib');
var CONFIG = require('./../config');
var filesLib = require('./PackageManager/files');
var DBManager = require('./db/DBManager');

var MapManager = function(app, callback) {
  this.app = app;
  this.gameServers = {};
  this.maps = {};
  this.itemsByName = {};

  this.load(callback);

  return this;
};

MapManager.prototype.addGameServer = function(map) {
  this.gameServers[map.name] = new(require('./GameServer'))(this.app, map, this);
};

MapManager.prototype.updateGameServerMap = function(map) {
  var gameServer = this.gameServers[map.name];
  gameServer.initGameServer(map);
  console.info('update game ', map.name);
};

MapManager.prototype.loadItems = function(callback) {
  var that = this;
  var path = CONFIG.serverPath + '/public/items';
  getJSONSForDirectory(path, function(item) {
    that.itemsByName[item.name] = item;
  }, callback);
};


function getJSONSForDirectory(path, action, callback) {
  filesLib.brosweFilesRec(path, function(err, files) {
    for (var i = 0; i < files.length; i++) {
      var fName = files[i];
      var filePath = fName;
      var content = fs.readFileSync(filePath);
      var item = JSON.parse(content);
      action(item);
    };
    if (KLib.isFunction(callback)) {
      return callback(null);
    }
  });
};



MapManager.prototype.createOrUpdateMap = function(map) {
  if (KLib.isUndefined(this.maps[map])) {
    this.addGameServer(map);
  } else {
    this.updateGameServerMap(map);
  }
  this.maps[map.name] = map;
};

MapManager.prototype.loadMap = function(mapName) {
  var content = fs.readFileSync(mapName);
  var map = JSON.parse(content);
  map.staticItems = map.staticItems.concat([{
    name: 'outsideWall'
  }]);
  var itemsDir = CONFIG.serverPath + '/public/items/';
  for (var i = 0; i < map.staticItems.length; i++) {
    var item = map.staticItems[i];
    var itemJSONPath = itemsDir + item.name + '.json';
    var itemJSONString = fs.readFileSync(itemJSONPath);
    item.def = JSON.parse(itemJSONString);
  }
  if (map.enable === true) {
    this.createOrUpdateMap(map);
  }
};

MapManager.prototype.loadMaps = function(callback) {
  var that = this;
  var mapsPath = CONFIG.serverPath + '/public/maps';
  filesLib.brosweFilesRec(mapsPath, function(err, maps) {
    for (var i = 0; i < maps.length; i++) {
      var mName = maps[i];
      that.loadMap(mName);
    };
    if (KLib.isFunction(callback)) {
      return callback(null);
    }
  });
};

MapManager.prototype.getMapsWithPlayers = function() {
  var maps = {};
  for (var i in this.gameServers) {
    var gServer = this.gameServers[i];
    maps[gServer.map.name] = {
      'map': gServer.map.name,
      'players': gServer.getPlayersForShare()
    };
  }
  return maps;
};

MapManager.prototype.load = function(callback) {
  var that = this;
  if (CONFIG.performanceTest) {
    console.info('loading performance test map')
    this.loadMap(CONFIG.serverPath + '/performanceTestMap.json')
  } else {
    this.loadMaps(function(err) {
      console.info('maps loaded')
      that.gameServerSocket = new(require('./GameServerSocket'))(that);
      that.loadItems(function(err) {
        if (KLib.isFunction(callback)) {
          return callback(null, that);
        }
      })
    });
  }
}


MapManager.prototype.getVictories = function(callback) {
  var UserController = require('./db/UserController');

  UserController.collection().find().sort({
    victories: -1
  }).limit(15).toArray(function(err, res) {
    if (err) {
      console.error('ERROR: Could not get victories', err)
      callback(err)
    } else {
      callback(null, res)
    }
  });
}

MapManager.prototype.getNumBots = function() {
  var numBots = 0;
  for (var mapName in this.maps) {
    numBots += Object.keys(this.gameServers[mapName].botManager.bots).length;
  }
  return numBots;
}

module.exports = MapManager;
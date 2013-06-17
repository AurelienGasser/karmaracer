var fs = require('fs');
var KLib = require('./classes/KLib');
var CONFIG = require('./../config');
var filesLib = require('./PackageManager/files');


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

  var DBManager = require('./../db/DBManager');
  DBManager.connect(function(err, client) {
    if (err) {
      return null;
    }
    DBManager.getCollection('users', function(err, users) {
      if (err) {
        return null;
      }
      that.collectionUsers = users;
    })
  });

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
  this.collectionUsers.find({
    victories: {
      $gt: 0
    }
  }).sort({
    victories: -1
  }).limit(10).toArray(function(err, res) {
    if (err) {
      console.error('ERROR: Could not get victories', err)
      callback(err)
    } else {
      callback(null, res)
    }
  });
}

module.exports = MapManager;
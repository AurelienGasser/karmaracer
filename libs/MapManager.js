var fs = require('fs');
var KLib = require('./classes/KLib');
var CONFIG = require('./../config');
var filesLib = require('./PackageManager/files');
var mongodb = require('mongodb');

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
}


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
}




MapManager.prototype.createOrUpdateMap = function(map) {
  // if (Object.keys(that.maps).length > 0){
  //   console.error('MAPS LEAVE', Object.keys(that.maps).length );
  //   return;
  // }
  if (KLib.isUndefined(this.maps[map])) {
    this.addGameServer(map);
  } else {
    this.updateGameServerMap(map);
  }
  this.maps[map.name] = map;

}

MapManager.prototype.loadMaps = function(callback) {
  var that = this;
  var mapsPath = CONFIG.serverPath + '/public/maps';
  filesLib.brosweFilesRec(mapsPath, function(err, maps) {
    for (var i = 0; i < maps.length; i++) {
      var mName = maps[i];
      var content = fs.readFileSync(mName);
      var map = JSON.parse(content);
      if (map.enable === true) {
        that.createOrUpdateMap(map);
      }
    };
    if (KLib.isFunction(callback)) {
      return callback(null);
    }
  });
}

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
}

MapManager.prototype.connectToDb = function(callback) {
  var that = this;
  var client = new mongodb.Db('test', new mongodb.Server("127.0.0.1", 27017, {}), {w: 1});
  client.open(function(err, p_client) {
    if (err) {
      console.log('ERROR connecting to DB', err)
      callback(err);
    } else {
      that.db = p_client;
      client.collection('victories', function(err, victories) {
        if (err) {
          console.log('ERROR connecting to DB collection', err)
        } else {
          that.collectionVictories = victories;
          console.log('connected to db');
        }
        callback(err);
      });
    }
  });
}

MapManager.prototype.load = function(callback) {
  var that = this;
  this.connectToDb(function(err) {
  })
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

module.exports = MapManager;
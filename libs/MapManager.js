var fs = require('fs');
var KLib = require('./classes/KLib');
var CONFIG = require('./../config');
var filesLib = require('./PackageManager/files');

var MapManger = function(app, callback) {
  this.app = app;
  this.gameServers = {};
  this.maps = {};
  this.itemsByName = {};

  var that = this;

  function addGameServer(map) {
    that.gameServers[map.name] = new(require('./GameServer'))(that.app, map);
  };

  function updateGameServerMap(map) {
    var gameServer = that.gameServers[map.name];
    gameServer.initGameServer(map);
    console.info('update game ', map.name);
  };

  function loadItems(callback) {
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




  function createOrUpdateMap(map) {
    // if (Object.keys(that.maps).length > 0){
    //   console.error('MAPS LEAVE', Object.keys(that.maps).length );
    //   return;
    // }
    if (KLib.isUndefined(that.maps[map])) {
      addGameServer(map);
    } else {
      updateGameServerMap(map);
    }
    that.maps[map.name] = map;

  }

  function loadMaps(callback) {
    var mapsPath = CONFIG.serverPath + '/public/maps';
    filesLib.brosweFilesRec(mapsPath, function(err, maps) {
      for (var i = 0; i < maps.length; i++) {
        var mName = maps[i];
        var content = fs.readFileSync(mName);
        var map = JSON.parse(content);
        if (map.enable === true) {
          createOrUpdateMap(map);
        }
      };
      if (KLib.isFunction(callback)) {
        return callback(null);
      }
    });
  }

  function getMapsWithPlayers() {
    var maps = {};
    for (var i in that.gameServers) {
      var gServer = that.gameServers[i];
      maps[gServer.map.name] = {
        'map': gServer.map.name,
        'players': gServer.getPlayersForShare()
      };
    }
    return maps;
  }

  var res = {
    'createOrUpdateMap': createOrUpdateMap,
    'app': that.app,
    'gameServers': that.gameServers,
    'maps': that.maps,
    'itemsByName': that.itemsByName,
    'getMapsWithPlayers': getMapsWithPlayers
  };


  function load(callback) {
    loadMaps(function(err) {
      console.info('maps loaded')
      that.gameServerSocket = new(require('./GameServerSocket'))(res);
      loadItems(function(err) {
        if (KLib.isFunction(callback)) {
          return callback(null, that);
        }
      })
    });
  }

  load(callback);


  return res;
};

module.exports = MapManger;
var fs = require('fs');
var _ = require('underscore');


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
      console.log('update game ', map.name);
    };

    function loadItems(callback) {
      //that.itemsByName = {};
      var path = __dirname + '/public/items';
      getJSONSForDirectory(path, function(item) {
        that.itemsByName[item.name] = item;
      }, callback);
    }


    function getJSONSForDirectory(path, action, callback) {
      brosweFilesRec(path, function(err, files) {
        for(var i = 0; i < files.length; i++) {
          var fName = files[i];
          var filePath = fName;
          var content = fs.readFileSync(filePath);
          var item = JSON.parse(content);
          action(item);
        };
        if(_.isFunction(callback)) {
          return callback(null);
        }
      });
    }


    function brosweFilesRec(path, callback) {
      var walk = require('walk');
      var files = [];

      // Walker options
      var walker = walk.walk(path, {
        followLinks: false
      });

      walker.on('file', function(root, stat, next) {
        // Add this file to the list of files
        files.push(root + '/' + stat.name);
        next();
      });

      walker.on('end', function() {
        //console.log(files);
        return callback(null, files);
      });
    };

    function createOrUpdateMap(map) {

      console.log('c or u map ', map.name);
      if(_.isUndefined(that.maps[map])) {
        addGameServer(map);
      } else {
        updateGameServerMap(map);
      }
      that.maps[map.name] = map;

    }

    function loadMaps(callback) {
      var mapsPath = __dirname + '/public/maps';
      brosweFilesRec(mapsPath, function(err, maps) {
        for(var i = 0; i < maps.length; i++) {
          var mName = maps[i];
          var content = fs.readFileSync(mName);
          var map = JSON.parse(content);
          createOrUpdateMap(map);
        };
        if(_.isFunction(callback)) {
          return callback(null);
        }
      });
    }

    var res = {
      'createOrUpdateMap': createOrUpdateMap,
      'app': that.app,
      'gameServers': that.gameServers,
      'maps': that.maps,
      'itemsByName': that.itemsByName
    };


    function load(callback) {
      loadMaps(function(err) {
        console.log('maps loaded')
        that.gameServerSocket = new(require('./GameServerSocket'))(res);
        loadItems(function(err) {
          if(_.isFunction(callback)) {
            return callback(null, that);
          }
        })
      });
    }

    load(callback);


    return res;
  };

module.exports = MapManger;
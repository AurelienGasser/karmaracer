(function() {
  "use strict";

  var MiniMap = function($container, mapName, connection, items) {
    this.$container = $container;
    this.connection = connection;
    this.canvasID = 'minimap-' + mapName;
    this.$canvas = $('<canvas id="' + this.canvasID + '" class="miniMap"></canvas>');
    this.$container.append(this.$canvas);
    this.canvas = this.$canvas[0];

    this.items = items;
    if (KLib.isUndefined(this.items)) {
      this.items = {
        mycar: null,
        cars: [],
        projectiles: [],
        explosions: []
      };
    }

    this.getMap(mapName, function(err, map) {});
  };

  MiniMap.prototype.getMap = function(mapName, callback) {
    var that = this;

    var getMiniMap = function(err, worldInfo) {
      that.drawEngine = Karma.getDrawEngine(that.canvasID, 'CANVAS', that.items, worldInfo, 4, undefined, that.connection,function(drawEngine) {
        that.drawEngine.canvasSize = that.drawEngine.worldInfo.size;
        that.drawEngine.resize();
        that.drawEngine.tick();
        that.drawEngine.isMiniMap = true;
      });
      if (KLib.isFunction(callback)) {
        return callback(null);
      }
    };

    this.connection.emit('getMiniMap', {
      'name': mapName
    }, getMiniMap);


  };

  Karma.MiniMap = MiniMap;



}());
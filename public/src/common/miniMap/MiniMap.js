(function() {
  "use strict";

  var MiniMap = function($container, mapName, connection) {
    this.$container = $container;
    this.connection = connection;
    this.canvasID = 'minimap-' + mapName;
    this.$canvas = $('<canvas id="' + this.canvasID + '" class="miniMap"></canvas>');
    this.$container.append(this.$canvas);
    this.canvas = this.$canvas[0];

    this.getMap(mapName, function(err, map) {});
  };

  MiniMap.prototype.getMap = function(mapName, callback) {

    var that = this;
    var getMiniMap = function(err, worldInfo) {
      // that.$canvas.width(worldInfo.size.w);
      // that.$canvas.height(worldInfo.size.h);
      var items = {
        cars: [],
        mycar: null,
        projectiles: [],
        explosions: []
      };
      that.drawEngine = Karma.getDrawEngine(that.canvasID, 'CANVAS', items, worldInfo, function(drawEngine) {
        that.drawEngine.setGScale(1 / 6); // set to default size
        // that.drawEngine.setGScale(5);
        that.drawEngine.canvasSize = that.drawEngine.worldInfo.size;
        that.drawEngine.resize();
        that.drawEngine.tick();
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
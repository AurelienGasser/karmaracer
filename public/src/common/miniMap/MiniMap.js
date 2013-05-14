(function() {
  "use strict";

  var MiniMap = function($container, mapName, connection, items, mycarPosition) {
    this.$container = $container;
    this.connection = connection;
    this.canvasID = 'minimap-' + mapName;
    this.$canvas = $('<canvas id="' + this.canvasID + '" class="miniMap"></canvas>');
    this.$container.append(this.$canvas);
    this.canvas = this.$canvas[0];

    this.items = items;
    if (!KLib.isUndefined(mycarPosition)) {
      this.playerPositionID = 'player-position-on-minimap-' + mapName;
      this.$playerPosition = $('<div class="miniMapPlayerPosition" id="' + this.playerPositionID + '"></div>');
      this.$container.append(this.$playerPosition);
      this.mycarPosition = mycarPosition;
    }


    this.getMap(mapName, function(err, map) {});
  };

  MiniMap.prototype.getMap = function(mapName, callback) {

    var that = this;

    var items = {
      cars: [],
      mycar: null,
      projectiles: [],
      explosions: []
    };


    var getMiniMap = function(err, worldInfo) {
      // that.$canvas.width(worldInfo.size.w);
      // that.$canvas.height(worldInfo.size.h);
      that.drawEngine = Karma.getDrawEngine(that.canvasID, 'CANVAS', items, worldInfo, function(drawEngine) {
        that.drawEngine.setGScale(1 / 8); // set to default size
        that.drawEngine.canvasSize = that.drawEngine.worldInfo.size;
        that.drawEngine.resize();
        that.drawEngine.tick();
      });


      setInterval(function() {
        if (!KLib.isUndefined(that.mycarPosition)) {
          var pos = that.$canvas.position();
          var left = (pos.left + that.mycarPosition.x * 4);
          var top = (pos.top + that.mycarPosition.y * 4);
          that.$playerPosition[0].style.left = left + 'px';
          that.$playerPosition[0].style.top = top + 'px';
        }
      }, 1000 / 15);

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
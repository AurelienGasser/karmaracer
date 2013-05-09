(function() {
  "use strict";

  var MiniMap = function($container, mapName, connection) {
    this.$container = $container;
    this.connection = connection;
    this.canvasID = 'minimap-' + mapName;
    this.$canvas = $('<canvas id="' + this.canvasID + '" class="miniMap"></canvas>');
    this.$container.append(this.$canvas);
    this.canvas = this.$canvas[0];

    this.getMap(mapName, function(err, map){      
    });
  };

  MiniMap.prototype.getMap = function(mapName, callback) {

    var that = this;
    var getMiniMap = function(err, worldInfo) {
      that.$canvas.css('width', worldInfo.size.w / 5);
      that.$canvas.css('height', worldInfo.size.h / 5);
      console.log('minimap info', worldInfo);
      var items = {
        cars : [],
        mycar : null,
        projectiles : [],
        explosions : []
      };
      that.drawEngine = Karma.getDrawEngine(that.canvasID, 'CANVAS', items, worldInfo, function(drawEngine){
        that.drawEngine.canvasSize = worldInfo.size;      
        console.log('loaded');
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
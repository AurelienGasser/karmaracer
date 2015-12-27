(function() {
  "use strict";

  var Minimap = function($container, mapName, connection, items, gameInstance) {
    this.$container = $container;
    this.connection = connection;
    this.canvasID = 'minimap-' + mapName;
    this.$canvas = $('<canvas id="' + this.canvasID + '" class="miniMap"></canvas>');
    this.$container.append(this.$canvas);
    this.canvas = this.$canvas[0];
    this.gameInstance = gameInstance;
    
    if (!this.gameInstance){
      this.gameInstance = null;
    }

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
  
  Minimap.prototype.onDrawEngineReady = function(err, drawEngine) {
    if (err) {
      console.log('cannot display minimap');
    } else {
      this.drawEngine = drawEngine;
      this.drawEngine.canvasSize = this.drawEngine.worldInfo.size;
      this.drawEngine.resize();
      this.drawEngine.tick();            
    }    
  };
  
  Minimap.prototype.onWorldInfoReady = function(err, worldInfo) {
    if (err) {
      console.log('cannot create minimap');
    } else {
      Karma.getDrawEngine(true, this.canvasID, 'CANVAS', this.items, worldInfo, 4, this.gameInstance, this.connection, this.onDrawEngineReady.bind(this));
    }
  };

  Minimap.prototype.getMap = function(mapName, callback) {
    this.connection.emit('getMinimap', {
      'name': mapName
    }, this.onWorldInfoReady.bind(this));
  };

  Karma.Minimap = Minimap;

}());
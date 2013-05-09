(function() {
  "use strict";

  var MiniMap = function($container, mapName, connection) {
    this.$container = $container;
    this.connection = connection;
    this.$canvas = $('<canvas class="miniMap"></canvas>');
    this.$container.append(this.$canvas);
    this.canvas = this.$canvas[0];
    console.log(this.canvas);
    this.ctx = this.canvas.getContext("2d");

    this.getMap(mapName, function(err, map){
      console.log(err, map);
    });
  };

  MiniMap.prototype.getMap = function(mapName, callback) {

    var that = this;
    var getMiniMap = function(err, map) {
      console.log('get map callback', err, map);

      that.ctx.canvas.width = map.size.w;
      that.ctx.canvas.height = map.size.h;




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
/*global G_mapName, io*/

(function(io) {
  "use strict";

  function Map(selector) {

    var host = window.location.hostname;
    this.connection = io.connect(host);

    this.MapItems = {};
    this.selectedItems = [];
    this.canvasMousePosition = {
      "x": 0,
      "y": 0
    };
    this.mouseDownPosition = {
      "x": 0,
      "y": 0
    };
    this.translateMousePosition = {
      "x": 0,
      "y": 0
    };

    this.idCount = 0;


    this.keyPress = {
      shift: false
    };

    this.selectedZone = {
      "x": 0,
      "y": 0,
      "w": 0,
      "h": 0
    };
    this.keyboardHandler = new Karma.KeyboardHandlerMap(this);

    this.scale = 1;
    this.gScale = 16;

    this.translate = {
      "x": 0,
      "y": 0
    };
    this.realWorldSize = {
      "w": 64 * this.gScale,
      "h": 32 * this.gScale
    };
    this.mapName = G_mapName;
    this.mapBackgroundName = '';
    this.itemsByName = {};
    this.zoomBox = null;
    this.enable = false;
    this.backgroundItems = [];

    this.$map = $(selector);

    this.$map.css('width', this.realWorldSize.w).css('height', this.realWorldSize.h);


    this.itemsGlow = {};
  }


  Map.prototype.resize = function() {
    this.$map.css('width', this.realWorldSize.w).css('height', this.realWorldSize.h);
  };

  Map.prototype.loadMap = function(mapName, callback) {
    var that = this;
    that.connection.emit('get_map', mapName, function(err, map) {
      if (err !== null) {
        Karma.Log.error('no map with name', mapName);
        return callback({
          'msg': 'no map with name',
          'type': 'warn'
        });
      }
      that.mapBackgroundName = map.background.name;
      that.enable = map.enable;

      $('#map-width').val(map.size.w);
      $('#map-height').val(map.size.h);
      var $enable = $('#map-enable');

      if (map.enable === true) {
        $enable.prop('checked', true);
      }
      $enable.click(function() {
        that.enable = this.checked;
      });

      that.realWorldSize.w = map.size.w * that.gScale;
      that.realWorldSize.h = map.size.h * that.gScale;


      that.resize();
      for (var i = 0; i < map.staticItems.length; i++) {
        var sItem = map.staticItems[i];
        var sItemFull = that.itemsByName[sItem.name];

        if (!sItem.position || !sItem.size) {
          continue;
        }
        var mapItem = that.createMapItem(sItemFull);

        mapItem.position.x = sItem.position.x * that.gScale;
        mapItem.position.y = sItem.position.y * that.gScale;
        mapItem.size.w = sItem.size.w * that.gScale;
        mapItem.size.h = sItem.size.h * that.gScale;

      }

      // if (!KLib.isUndefined(that.svgTag)){
      //   that.svgLoad();
      // }

      if (_.isFunction(callback)) {
        return callback(null);
      }

    });
  };


  Map.prototype.startTick = function() {
    var now = new Date();
    this.tickStart = now.getTime();
    this.tickCount = 0;
    this.tick();
  };



  Map.prototype.outputDebug = function() {

    var debugoutput = [];
    debugoutput.push('<li>Canvas Mouse Pos : ', this.canvasMousePosition.x, ', ', this.canvasMousePosition.y, '</li>');
    debugoutput.push('<li>Canvas Down Pos : ', this.mouseDownPosition.x, ', ', this.mouseDownPosition.y, '</li>');
    debugoutput.push('<li>Translate Down Pos : ', this.translateMousePosition.x, ', ', this.translateMousePosition.y, '</li>');

    debugoutput.push('<li>Action : ', this.action, '</li>');
    debugoutput.push('<li>ScaleCanvas : ', this.scale, '</li>');
    debugoutput.push('<li>TranslateCanvas : ', this.translate.x, ', ', this.translate.y, '</li>');

    debugoutput.push('<li>--------</li>');
    debugoutput.push('<li>Help</li>');
    debugoutput.push('<li>Arrows (move canvas)</li>');
    debugoutput.push('<li>R (release items)</li>');
    debugoutput.push('<li>P/L (zoom/unzoom)</li>');
    debugoutput.push('<li>S (set scale to 1)</li>');
    debugoutput.push('<li>Z (zoom to selected items)</li>');

    $("#canvas-debug").html(debugoutput.join(''));
  };

  Map.prototype.tick = function() {
    this.tickCount++;

    var now = new Date();
    var tickDiff = now.getTime() - this.tickStart;
    if (tickDiff > 1000) {
      $('#fps').html('fps:' + this.tickCount);
      this.tickCount = 0;
      this.tickStart = now.getTime();
    }
    requestAnimFrame(this.tick.bind(this));
    //this.canvasDraw();
    //this.svgDraw();
    this.outputDebug();

  };


  function step(items, action, callback) {
    var itemsLength = items.length;
    var itemCount = 0;

    function end() {
      if (itemCount === itemsLength - 1) {
        if (_.isFunction(callback)) {
          return callback(null);
        }
      }
      itemCount += 1;
    }
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      action(item, end);
    }
  }

  Map.prototype.loadItems = function(items, callback) {
    var that = this;
    step(items, function(itemName, end) {
      that.loadItemFromServer(itemName, function() {
        return end();
      });
    }, callback);
  };



  Map.prototype.addMapItemInDoForSelection = function(items, item) {


    var that = this;
    var itemID = 'item-' + item.name;
    var itemLi = $('<li class="item" id="' + itemID + '"></li>');
    var UL = $('<ul class="item-properties"/>');
    itemLi.append(UL);
    var demoDiv = $('<li class="kr-mm-demo"/>');


    function setBackground() {
      demoDiv.css('background-image', 'url("' + item.image.src + '")');
    }

    switch (item.patternType) {
      case 'both':
        var bgItem = {
          'name': item.name,
          'path': item.image.src
        };
        that.backgroundItems.push(bgItem);
        setBackground();
        break;
      case 'horizontal':
        setBackground();
        break;
      case 'vertical':
        setBackground();
        break;
      default:
        demoDiv.append('<img class="kr-item-demo" src="' + item.image.src + '"/>');
    }
    demoDiv.addClass('kr-mm-demo-' + item.patternType);
    UL.append('<li class="kr-pp-item-name">' + item.name + '</li>');

    UL.append(demoDiv);
    items.append(itemLi);

    $('#' + itemID).click(function() {
      var sourceMapItem = that.itemsByName[item.name];
      Karma.Log.info('add map item', sourceMapItem);
      var mapItem = that.createMapItem(sourceMapItem);
      mapItem.size.w = sourceMapItem.size.w * that.gScale;
      mapItem.size.h = sourceMapItem.size.h * that.gScale;
      that.svgRaphaelAddItem(mapItem);
    });

  };

  Map.prototype.createMapItem = function(sourceMapItem) {
    var that = this;
    var timestamp = that.idCount++;
    var mapItem = new Karma.MapItem(sourceMapItem, that.ctx, timestamp);
    mapItem.image = sourceMapItem.image;
    mapItem.pattern = sourceMapItem.pattern;
    that.MapItems[timestamp] = mapItem;
    return mapItem;
  };

  Map.prototype.removeMapItem = function(id) {
    delete this.MapItems[id];
  };

  Map.prototype.loadItemFromServer = function(item, callback) {
    var that = this;
    var itemsDOMContainer = $('#items');
    if (_.isFunction(callback)) {
      var mapItem = new Karma.MapItem(item, that.ctx, item.name);

      mapItem.initImage(function(err, mapItemWithImage) {
        that.addMapItemInDoForSelection(itemsDOMContainer, mapItemWithImage);
        that.itemsByName[mapItem.name] = mapItemWithImage;
        return callback(null, mapItemWithImage);
      });
    }
  };

  Karma.Map = Map;

}(io));
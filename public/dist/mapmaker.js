/* public/src/mapmaker/startup.js */
(function(){}());
/* public/src/mapmaker/MapItem.js */
(function() {
  "use strict";

  function MapItem(_jsonItem, _ctx, _id) {
    this.id = _id;
    this.jsonItem = _jsonItem;
    this.position = {
      "x": 0,
      "y": 0
    };
    this.size = {
      "w": this.jsonItem.image.size,
      "h": this.jsonItem.image.size
    };
    this.name = this.jsonItem.name;
    this.patternType = this.jsonItem.patternType;
    this.pattern = undefined;
    this.zIndex = 0;
    this.path = this.jsonItem.image.path;

    this.ctx = _ctx;

    this.image = null;
  }

  MapItem.prototype.initImage = function(callback) {
    this.image = new Image();
    this.image.src = this.jsonItem.image.path;
    this.image.crop = this.jsonItem.image.crop;

    var that = this;

    that.image.onerror = function() {};

    that.image.onload = function() {

      if (that.patternType !== "none" && !KLib.isUndefined(that.ctx)) {
        that.pattern = that.ctx.createPattern(that.image, 'repeat');
      } else {}
      return callback(null, that);
    };

  };


  MapItem.prototype.scale = function(canvasMousePosition, scaleMousePosition, keyPress) {
    var translateVector;
    var diffx = canvasMousePosition.x - scaleMousePosition.x;
    var diffy = canvasMousePosition.y - scaleMousePosition.y;
    if (keyPress.shift) {
      var min = Math.min(diffx, diffy);
      translateVector = {
        "x": min,
        "y": min
      };
    } else {
      translateVector = {
        "x": diffx,
        "y": diffy
      };
    }
    if (this.patternType == 'vertical') {
      this.size.w = this.image.crop.w;
    } else {
      this.size.w += translateVector.x;
    }
    if (this.patternType == 'horizontal') {
      this.size.h = this.image.crop.h;
    } else {
      this.size.h += translateVector.y;
    }
    // To prevent negative dimensions
    this.size.w = Math.max(this.size.w, 1);
    this.size.h = Math.max(this.size.h, 1);
  };
  Karma.MapItem = MapItem;
}());
/* public/src/mapmaker/mapmaker.js */
(function() {
  "use strict";

  function addProperties(map) {

    setNameEvents(map);
    setBackgroundItemsEvents(map);
    setSizeEvents(map);
  }

  function setNameEvents(map) {
    var inputName = $('#map-name');
    inputName.keyup(function() {
      map.mapName = inputName.val();
      map.loadMap(map.mapName);
    });
    inputName.val(map.mapName);
  }


  function setSizeEvents(map) {
    var widthDOM = $('#map-width');
    var heightDOM = $('#map-height');

    function updateSizeFromDOM() {
      var w = parseInt(widthDOM.val(), 10) * map.gScale;
      var h = parseInt(heightDOM.val(), 10) * map.gScale;
      map.realWorldSize.w = w;
      map.realWorldSize.h = h;
      map.resize();
    }

    widthDOM.change(updateSizeFromDOM);
    heightDOM.change(updateSizeFromDOM);
  }


  function setBackgroundItemsEvents(map) {
    var inputName = $('#map-bg');

    var o = [];
    o.push('<datalist id="bg-list">');
    for (var i = 0; i < map.backgroundItems.length; i++) {
      var bg = map.backgroundItems[i];
      o.push('<option value="', bg.name, '">');
      o.push(bg.name, '</option>');
    }
    o.push('</datalist>');

    inputName.after(o.join(''));
    inputName.keyup(function() {
      map.mapBackgroundName = inputName.val();
      map.svgDrawBackground();
    });
    inputName.val(map.mapBackgroundName);
  }


  function start() {

    var mapID = "map-canvas";

    var map = new Karma.Map('#' + mapID);
    // console.log(Map, map);
    //var items = ['wall', 'stone', 'grass', 'grass3', 'stone_l', 'stone_r', 'stone_t', 'stone_b', 'tree1'];
    map.connection.emit('get_items', function(err, itemsByName) {
      var items = [];
      for (var itemName in itemsByName) {
        items.push(itemsByName[itemName]);
      }
      map.loadItems(items, function() {
        map.loadMap(map.mapName, function() {
          addProperties(map);
          //map.startTick();
          map.svgInit(mapID);
        });
      });
    });

    $("#save-map-node").click(function() {
      map.saveMap();
    });
  }

  $(function() {

    start();

  });

}());
/* public/src/mapmaker/Map/Map.js */
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
/* public/src/mapmaker/Map/actions.js */
(function(Map) {
  "use strict";
  
  Map.prototype.startTranslating = function() {
    this.action = 'translate';
    this.translateMousePosition = this.mouseDownPosition;
  };

  Map.prototype.translateSelectedItemsUsingMousePosition = function() {
    var translateVector = {
      "x": this.canvasMousePosition.x - this.translateMousePosition.x,
      "y": this.canvasMousePosition.y - this.translateMousePosition.y
    };
    _.each(this.selectedItems, function(id) {
      var item = this.MapItems[id];
      item.position = {
        "x": item.position.x + translateVector.x,
        "y": item.position.y + translateVector.y
      };
    }.bind(this));
    this.translateMousePosition = this.canvasMousePosition;
  };

  Map.prototype.startScaling = function() {
    this.action = 'scale';
    this.scaleMousePosition = this.mouseDownPosition;
  };

  Map.prototype.scaleItemsUsingCanvasMouse = function() {
    _.each(this.selectedItems, function(id) {
      var item = this.MapItems[id];
      item.scale(this.canvasMousePosition, this.scaleMousePosition, this.keyPress);
    }.bind(this));
    this.scaleMousePosition = this.canvasMousePosition;
  };

}(Karma.Map));
/* public/src/mapmaker/Map/drawCanvas.js */
(function(Map) {
  "use strict";

  Map.prototype.canvasInit = function(selector) {


    var canvasID = 'canvas-map';
    this.canvasTag = $('<canvas id="' + canvasID + '"/>');
    $(selector).append(this.canvasTag);

    this.canvas = $(selector).children('canvas')[0];
    this.ctx = this.canvas.getContext("2d");

    this.canvas.onmousemove = this.mouseMove.bind(this);
    this.canvas.onmousedown = this.mouseDown.bind(this);
    this.canvas.onmouseup = this.mouseUp.bind(this);
    this.canvasTag.css('width', this.realWorldSize.w).css('height', this.realWorldSize.h);
  };

  Map.prototype.canvasDrawBackground = function() {
    if (this.mapBackgroundName !== '') {
      var bg = this.itemsByName[this.mapBackgroundName];
      if (!KLib.isUndefined(bg)) {
        this.ctx.fillStyle = bg.pattern;
        this.ctx.fillRect(0, 0, this.realWorldSize.w, this.realWorldSize.h);
      }
    }
  };

  Map.prototype.canvasDraw = function() {
    this.ctx.canvas.width = $(this.canvas).width();
    this.ctx.canvas.height = $(this.canvas).height();

    this.ctx.save();

    this.ctx.scale(this.scale, this.scale);

    this.canvasDrawBackground();

    //draw world border
    this.ctx.fillStyle = '00f';
    this.ctx.strokeRect(0, 0, this.realWorldSize.w, this.realWorldSize.h);


    this.ctx.translate(this.translate.x, this.translate.y);
    this.ctx.scale(this.scale, this.scale);


    for (var i in this.MapItems) {
      var item = this.MapItems[i];
      this.canvasDrawItem(item);
    }

    // draw selected Zone
    if (this.action == 'selectZone') {
      this.canvasDrawSelectedZone();
    }


    this.ctx.restore();


    if (this.zoomBox !== null) {
      this.scale = this.realWorldSize.w * this.scale / this.zoomBox.w;
      this.translate.x = -this.zoomBox.x * this.scale;
      this.translate.y = -this.zoomBox.y * this.scale;
      this.zoomBox = null;
    }
  };

  Map.prototype.canvasDrawItem = function(item) {

    var isItemSelected = _.include(this.selectedItems, item.id);

    if (isItemSelected) {
      this.ctx.shadowOffsetX = 2;
      this.ctx.shadowOffsetY = 2;
      this.ctx.shadowBlur = 4;
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    } else {
      this.ctx.shadowBlur = 0;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 0;
    }
    if (item.patternType !== "none") {
      this.ctx.fillStyle = item.pattern;
      this.ctx.save();
      this.ctx.translate(item.position.x, item.position.y);
      this.ctx.fillRect(0, 0, item.size.w, item.size.h);
      this.ctx.restore();
    } else {
      this.ctx.drawImage(item.image, item.position.x, item.position.y, item.size.w, item.size.h);
    }
    if (isItemSelected) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.fillRect(item.position.x + item.size.w * 0.8, item.position.y + item.size.h * 0.8, item.size.w * 0.2, item.size.h * 0.2);
    }
  };

  Map.prototype.canvasDrawSelectedZone = function() {
    this.selectedZone.x = this.mouseDownPosition.x;
    this.selectedZone.y = this.mouseDownPosition.y;
    this.selectedZone.w = this.canvasMousePosition.x - this.mouseDownPosition.x;
    this.selectedZone.h = this.canvasMousePosition.y - this.mouseDownPosition.y;
    if (this.selectedZone.w < 0) {
      this.selectedZone.x += this.selectedZone.w;
      this.selectedZone.w *= -1;
    }
    if (this.selectedZone.h < 0) {
      this.selectedZone.y += this.selectedZone.h;
      this.selectedZone.h *= -1;
    }
    this.ctx.strokeStyle = 'f00';
    this.ctx.strokeRect(this.selectedZone.x, this.selectedZone.y, this.selectedZone.w, this.selectedZone.h);
  };

}(Karma.Map || {}));
/* public/src/mapmaker/Map/drawSvg.js */
(function(Map) {
  /*global Raphael*/
  "use strict";


  Map.prototype.svgRaphaelAddItem = function(item) {

    item.position.x -= item.size.w / 2;
    item.position.y -= item.size.h / 2;

    var that = this;
    var opacityStart = 1;
    var opacityDrag = 0.5;
    var c = this.R.rect(item.position.x, item.position.y, item.size.w, item.size.h).attr({
      //fill: "hsb(.8, 1, 1)",
      fill: "url('" + item.image.src + "')",
      stroke: "none",
      opacity: opacityStart,
      cursor: "move"
    });
    var size = 32;

    var s = this.R.rect(item.position.x + item.size.w - size, item.position.y + item.size.h - size, size, size).attr({
      fill: "hsb(0.8, 0.5, .5)",
      stroke: "none",
      opacity: opacityStart
    });


    var li = $('<li></li>');


    function getJOption(optName) {
      var opt = $('<div><a href="#">' + optName + '</a></div>');
      return opt;
    }

    function addOption(optName) {
      var opt = getJOption(optName);
      opt.click(function(e) {

        if (optName === 'toFront') {
          c[optName]();
          s[optName]();
        } else {
          s[optName]();
          c[optName]();
          that.bgImg.toBack();
        }

        e.preventDefault();
        return false;
      });
      li.append(opt);
    }

    addOption('toFront');
    addOption('toBack');
    var remove = getJOption('removeItem');
    li.append(remove);
    // li.append('size' + JSON.stringify(c.sizer) + c.sizer.attr('x'));
    // li.append('</br>pos' + JSON.stringify(item.position));
    remove.click(function() {
      that.removeMapItem(item.id);
      $(c.node).remove();
      $(s.node).remove();
    });

    c.li = li;
    $('#canvas-debug').append(li);
    $('#canvas-debug').children().hide();

    // start, move, and up are the drag functions
    var start = function() {
      // storing original coordinates
      this.ox = this.attr("x");
      this.oy = this.attr("y");
      this.attr({
        opacity: opacityDrag
      });

      this.sizer.ox = this.sizer.attr("x");
      this.sizer.oy = this.sizer.attr("y");
      this.sizer.attr({
        opacity: opacityStart
      });
    };
    var move = function(dx, dy) {
      // move will be called with dx and dy
      this.attr({
        x: this.ox + dx,
        y: this.oy + dy
      });
      item.position.x = this.ox + dx;
      item.position.y = this.oy + dy;
      this.sizer.attr({
        x: this.sizer.ox + dx,
        y: this.sizer.oy + dy
      });
      if (item.position.x < 0) {
        // this.sizer.attr('x', 0);
        item.position.x = 0;
      }
      if (item.position.y < 0) {
        // this.sizer.attr('y', 0);
        item.position.y = 0;
      }


    };
    var up = function() {
      // restoring state
      this.attr({
        opacity: opacityStart
      });
      this.sizer.attr({
        opacity: opacityStart
      });
    };
    var rstart = function() {
      // storing original coordinates
      this.ox = this.attr("x");
      this.oy = this.attr("y");

      this.box.ow = this.box.attr("width");
      this.box.oh = this.box.attr("height");
    };
    var rmove = function(dx, dy) {
      // move will be called with dx and dy
      this.attr({
        x: this.ox + dx,
        y: this.oy + dy
      });
      this.box.attr({
        width: this.box.ow + dx,
        height: this.box.oh + dy
      });
      item.size.w = this.box.attr("width");
      item.size.h = this.box.attr("height");

    };
    // rstart and rmove are the resize functions;
    $(c.node).click(function(e) {
      $('#canvas-debug').children().hide();
      c.li.show();


      li.find('div.mm-clean').remove();
      // li.append('size' + JSON.stringify(c.sizer) + c.sizer.attr('x'));
      li.append('<div class="mm-clean">pos : ' + JSON.stringify(item.position) + '</div>');
      li.append('<div class="mm-clean">size : ' + JSON.stringify(item.size) + '</div>');


      e.preventDefault();
      return false;
    });
    c.drag(move, start, up);
    c.sizer = s;
    s.drag(rmove, rstart);
    s.box = c;
    return c;
  };


  Map.prototype.svgInit = function(containerID) {

    this.R = new Raphael(containerID, this.realWorldSize.w, this.realWorldSize.h);
    $(this.R.canvas).click(function(e) {
      $('#canvas-debug').children().hide();
      e.preventDefault();
      return false;
    });
    this.svgLoad();
  };


  Map.prototype.svgLoad = function() {
    this.svgDraw();
  };

  Map.prototype.svgDraw = function() {
    this.svgDrawBackground();
    for (var i in this.MapItems) {
      var item = this.MapItems[i];
      this.svgRaphaelAddItem(item);
    }

  };



  Map.prototype.svgDrawBackground = function() {
    if (!KLib.isUndefined(this.bgImg)) {
      $(this.bgImg.node).remove();
    }
    if (this.mapBackgroundName !== '') {
      var bg = this.itemsByName[this.mapBackgroundName];
      if (!KLib.isUndefined(bg)) {

        this.bgImg = this.R.rect(0, 0, this.realWorldSize.w, this.realWorldSize.h);
        this.bgImg.attr({
          "fill": "url('" + bg.path + "')"
        });
      }
    }
  };

}(Karma.Map || {}));
/* public/src/mapmaker/Map/keyboard.js */
(function() {
  "use strict";

  function KeyboardHandlerMap(_canvasMap) {
    this.canvasMap = _canvasMap;
    document.onkeydown = this.handleKeyDown.bind(this);
    document.onkeyup = this.handleKeyUp.bind(this);
  }

  KeyboardHandlerMap.prototype.handleKey = function(key, down) {
    switch (key) {
      case 37:
        // left arrow
        this.canvasMap.translate.x += 5;
        break;
      case 39:
        // right arrow
        this.canvasMap.translate.x -= 5;
        break;
      case 38:
        // up arrow
        this.canvasMap.translate.y += 5;
        break;
      case 40:
        // down arrow
        this.canvasMap.translate.y -= 5;
        break;
      case 90:
        // Z
        if (!down) break;
        this.canvasMap.zoomToSelectedItems();
        break;
      case 83:
        // S
        if (!down) break;
        this.canvasMap.scale = 1;
        this.canvasMap.translate = {
          "x": 0,
          "y": 0
        };
        break;
      case 76:
        // L
        if (!down) break;
        this.canvasMap.scale *= 1.1;
        break;
      case 77:
        // M
        this.canvasMap.actionTranslate = down;
        if (down) {
          this.canvasMap.mouseDownPosition = this.canvasMap.canvasMousePosition;
        }
        break;
      case 80:
        // P
        if (!down) break;
        this.canvasMap.scale *= 0.9;
        break;
      case 82:
        // R
        if (down) {
          this.canvasMap.deselectAllItems();
        }
        break;
      case 16:
        // Shift
        this.canvasMap.keyPress.shift = down;
        break;
      default:
        //console.info(key);
    }
  };

  KeyboardHandlerMap.prototype.handleKeyDown = function(event) {
    this.handleKey(event.keyCode, true);
  };

  KeyboardHandlerMap.prototype.handleKeyUp = function(event) {
    this.handleKey(event.keyCode, false);
  };

  Karma.KeyboardHandlerMap = KeyboardHandlerMap;

}());
/* public/src/mapmaker/Map/mouse.js */
(function(Map) {
  "use strict";

  Map.prototype.mouseDown = function() {
    this.mouseDownPosition = this.canvasMousePosition;
    this.action = '';
    if (this.keyPress.shift) {
      _.each(this.MapItems, function(item) {
        if (this.isMousePositionInItem(item)) {
          if (this.isItemSelected(item.id)) {
            this.deselectItem(item.id);
          } else {
            this.selectItem(item.id);
          }
        }
      }.bind(this));
    } else {
      _.each(this.MapItems, function(item) {
        if (this.isMousePositionInItem(item)) {
          if (!this.isItemSelected(item.id)) {
            this.deselectAllItems();
            this.selectItem(item.id);
          }
          this.mouseDownOnItem = item;
          if (this.mouseDownInItemScaleZone(item, 0.8)) {
            this.startScaling();
          } else {
            this.startTranslating();
          }
        }
      }.bind(this));
      if (this.action != 'translate' && this.action != 'scale') {
        this.deselectAllItems();
        this.action = 'selectZone';
      }
    }
  };

  Map.prototype.mouseMove = function(e) {
    this.canvasMousePosition = {
      "x": e.pageX - this.canvas.offsetLeft - this.translate.x,
      "y": e.pageY - this.canvas.offsetTop - this.translate.y
    };
    this.canvasMousePosition.x *= 1 / this.scale;
    this.canvasMousePosition.y *= 1 / this.scale;
    var scale_cursor = 's-resize';
    if (this.action == 'scale') {
      document.body.style.cursor = scale_cursor;
    } else {
      var inScaleZone = false;
      _.each(this.MapItems, function(item) {
        if (inScaleZone) {
          return;
        }
        if (this.mouseDownInItemScaleZone(item, 0.9)) {
          // cursor over scale zome
          inScaleZone = true;
        }
      }.bind(this));
      if (inScaleZone) {
        document.body.style.cursor = scale_cursor;
      } else {
        document.body.style.cursor = 'default';
      }
    }
    // left click is pressed
    if (e.button === 0 && e.which === 1) {
      switch (this.action) {
        case 'translate':
          this.translateSelectedItemsUsingMousePosition();
          break;
        case 'scale':
          this.scaleItemsUsingCanvasMouse();
          break;
      }
    }
  };

  Map.prototype.mouseUp = function() {
    switch (this.action) {
      case 'selectZone':
        this.selectItemsInSelectedZone();
        break;
      case 'scale':
      case 'translate':
        break;
      default:
        break;
    }
    this.action = '';
  };

}(Karma.Map));
/* public/src/mapmaker/Map/save.js */
(function(Map) {
  "use strict";


  Map.prototype.saveMap = function() {

    var that = this;
    var iWidth = this.realWorldSize.w;
    var iHeight = this.realWorldSize.h;

    // this.canvas.toDataURL("image/png");
    var map = {
      "name": $('#map-name').val(),
      "enable": that.enable,
      "size": {
        "w": parseInt(iWidth / this.gScale, 10),
        "h": iHeight / this.gScale
      }
    };

    var path = '/sprites/bg_grass1.png';
    var itemBG = this.itemsByName[this.mapBackgroundName];
    if (!KLib.isUndefined(itemBG)) {
      path = itemBG.path;
    }

    if (!KLib.isUndefined(path)) {
      map.background = {
        'path': path,
        'name': this.mapBackgroundName
      };
    }
    map.staticItems = [];
    $.each(this.MapItems, function(id, item) {
      var jsonItem = {};
      jsonItem.name = item.name;
      jsonItem.position = {
        x: (item.position.x + item.size.w / 2) / that.gScale,
        y: (item.position.y + item.size.h / 2) / that.gScale
      };
      jsonItem.size = {
        w: parseInt(item.size.w / that.gScale, 10),
        h: parseInt(item.size.h / that.gScale, 10)
      };
      map.staticItems.push(jsonItem);
    });
    // var mapString = JSON.stringify(map);

    // var $c = $('<canvas id="canvasSave"></canvas>');
    // $('body').append($c)
    // var svg = this.$map.html().replace(/>\s+/g, ">").replace(/\s+</g, "<");
    // canvg('canvasSave', svg, {
    //   renderCallback: function() {
    //     var img = $c[0].toDataURL("image/png");

    //     var img = Canvas2Image.saveAsPNG($c[0], true);
    //     $("body").append(img);

    //   },
    //   ignoreMouse: true,
    //   ignoreAnimation: true
    // });


    this.connection.emit('saveMap', map);
  };
}(Karma.Map));
/* public/src/mapmaker/Map/select.js */
(function(Map) {
    "use strict";


    Map.prototype.zoomToSelectedItems = function() {
        var itemMostLeft;
        var itemMostRight;
        var itemMostTop;
        var itemMostBottom;
        _.each(this.selectedItems, function(id) {
            var item = this.MapItems[id];
            if (typeof itemMostLeft === "undefined") {
                itemMostLeft = item;
            }
            if (typeof itemMostRight === "undefined") {
                itemMostRight = item;
            }
            if (typeof itemMostTop === "undefined") {
                itemMostTop = item;
            }
            if (typeof itemMostBottom === "undefined") {
                itemMostBottom = item;
            }
            if (item.position.x < itemMostLeft.position.x) itemMostLeft = item;
            if (item.position.x + item.size.w > itemMostRight.position.x + itemMostRight.size.w) itemMostRight = item;
            if (item.position.y < itemMostTop.position.y) itemMostTop = item;
            if (item.position.y + item.size.h > itemMostBottom.position.y + itemMostBottom.size.h) itemMostBottom = item;
        }.bind(this));
        var margin = 20;
        if (this.selectedItems.length > 0) {
            this.zoomBox = {
                "x": itemMostLeft.position.x - margin,
                "y": itemMostTop.position.y - margin,
                "w": itemMostRight.position.x + itemMostRight.size.w - itemMostLeft.position.x + 2 * margin,
                "h": itemMostBottom.position.y + itemMostBottom.size.h - itemMostTop.position.y + 2 * margin
            };
        }
    };

    Map.prototype.mouseDownInItemScaleZone = function(item, scaleZonePercentage) {
        if (this.canvasMousePosition.x < item.position.x + item.size.w * scaleZonePercentage) return false;
        if (this.canvasMousePosition.x > item.position.x + item.size.w) return false;
        if (this.canvasMousePosition.y < item.position.y + item.size.h * scaleZonePercentage) return false;
        if (this.canvasMousePosition.y > item.position.y + item.size.h) return false;
        return true;
    };


    Map.prototype.selectItemsInSelectedZone = function() {
        _.each(this.MapItems, function(item) {
            if (item.position.x < this.selectedZone.x) return;
            if (item.position.y < this.selectedZone.y) return;
            if (item.position.x + item.size.w > this.selectedZone.x + this.selectedZone.w) return;
            if (item.position.y + item.size.h > this.selectedZone.y + this.selectedZone.h) return;
            this.selectItem(item.id);
        }.bind(this));
    };

    Map.prototype.isMousePositionInItem = function(item) {
        if (this.canvasMousePosition.x < item.position.x) return false;
        if (this.canvasMousePosition.x > item.position.x + item.size.w) return false;
        if (this.canvasMousePosition.y < item.position.y) return false;
        if (this.canvasMousePosition.y > item.position.y + item.size.h) return false;
        return true;
    };


    Map.prototype.deselectAllItems = function() {
        for (var id in this.itemsGlow) {
            this.deselectItem(id);
        }
        this.selectedItems = [];
    };

    Map.prototype.isItemSelected = function(id) {
        return _.include(this.selectedItems, id);
    };

    Map.prototype.selectItem = function(id, rect) {
        this.selectedItems.push(id);

        if (!KLib.isUndefined(rect)) {
            rect.isSelected = true;
            this.itemsGlow[id] = rect;
            $(rect).attr('stroke', '#000');
            $(rect.rectSelected).show();
        }

    };

    Map.prototype.deselectItem = function(id) {
        this.selectedItems.splice(this.selectedItems.indexOf(id), 1);
        var rect = this.itemsGlow[id];
        if (!KLib.isUndefined(rect)) {
            rect.isSelected = false;
            $(rect.rectSelected).hide();
            $(rect).attr('stroke', 'transparent');
        }
    };

}(Karma.Map));
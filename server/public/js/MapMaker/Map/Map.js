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
  this.keyboardHandler = new KeyboardHandlerMap(this);

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
  this.backgroundItems = [];

  $(selector).css('width', this.realWorldSize.w).css('height', this.realWorldSize.h);
  

  this.itemsGlow = {};
  var that = this;



}

Map.prototype.loadMap = function(mapName, callback) {
  var that = this;
  //console.log('loading map', mapName)
  that.connection.emit('get_map', mapName, function(err, map) {
    //console.log('get map', that.mapName);
    if(err !== null) {
      console.log('no map with name', mapName);
      return callback({
        'msg': 'no map with name',
        'type': 'warn'
      });
    }
    //console.log('map ok', map);
    that.mapBackgroundName = map.background.name;

    for(var i = 0; i < map.staticItems.length; i++) {
      var sItem = map.staticItems[i];
      var sItemFull = that.itemsByName[sItem.name];

      var mapItem = that.createMapItem(sItemFull);
      mapItem.position.x = sItem.position.x * that.gScale;
      mapItem.position.y = sItem.position.y * that.gScale;
      mapItem.size.w = sItem.size.w * that.gScale;
      mapItem.size.h = sItem.size.h * that.gScale;
      //console.log('create', mapItem);      
    };

    // if (!_.isUndefined(that.svgTag)){
    //   that.svgLoad();
    // }

    if(_.isFunction(callback)) {
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



Map.prototype.outputDebug  = function() {
  
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
  //console.log(tickDiff);
  if(tickDiff > 1000) {
    $('#fps').html('fps:' + this.tickCount);
    this.tickCount = 0;
    this.tickStart = now.getTime();
  }
  requestAnimFrame(this.tick.bind(this));
  //this.canvasDraw();
  //this.svgDraw();


  this.outputDebug();
  //   if (this.action =
  //   
  //   = 'translate'){
  //    this.translateSelectedItemsUsingMousePosition();
  //   }
};


function Step(items, action, callback) {
  var itemsLength = items.length;
  var itemCount = 0;

  function end() {
    //console.log(itemCount, itemsLength - 1);
    if(itemCount === itemsLength - 1) {
      if(_.isFunction(callback)) {
        console.log('step end');
        return callback(null);
      }
    }
    itemCount += 1;
  }
  for(var i = 0; i < items.length; i++) {
    var item = items[i];
    action(item, end);
  };
}

Map.prototype.loadItems = function(items, callback) {
  var that = this;
  Step(items, function(itemName, end) {
    that.loadItemFromServer(itemName, function(err, mapItem) {

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
  switch(item.patternType) {
  case 'both':
    var bgItem = {
      'name': item.name,
      'path': item.image.src
    };
    that.backgroundItems.push(bgItem);
    //console.log(that.backgroundItems);
  case 'horizontal':
  case 'vertical':
    demoDiv.css('background-image', 'url("' + item.image.src + '")');
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
    console.log('add map item', sourceMapItem);
    var mapItem = that.createMapItem(sourceMapItem);
    mapItem.size.w = sourceMapItem.size.w * that.gScale;
    mapItem.size.h = sourceMapItem.size.h * that.gScale;
    that.svgDrawItem(mapItem);
  });

};

Map.prototype.createMapItem = function(sourceMapItem) {
  var that = this;
  // var now = new Date();
  var timestamp = that.idCount++;
  var mapItem = new MapItem(sourceMapItem, that.ctx, timestamp);
  mapItem.image = sourceMapItem.image;
  mapItem.pattern = sourceMapItem.pattern;
  that.MapItems[timestamp] = mapItem;
  // console.log('add item', timestamp);
  return mapItem;
};

Map.prototype.loadItemFromServer = function(item, callback) {
  var that = this;
  var itemsDOMContainer = $('#items');
  //$.getJSON('/items/' + itemName + '.json', function(item) {
  if(_.isFunction(callback)) {
    var mapItem = new MapItem(item, that.ctx, item.name);

    mapItem.initImage(function(err, mapItemWithImage) {
      that.addMapItemInDoForSelection(itemsDOMContainer, mapItemWithImage);
      that.itemsByName[mapItem.name] = mapItemWithImage;
//      console.log('item loaded', mapItemWithImage.name);
      return callback(null, mapItemWithImage);
    });
  }

  // });
};
function Map(selector) {
  this.canvas = $(selector)[0];
  this.connection = io.connect(serverHost);

  this.ctx = this.canvas.getContext("2d");
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
  this.canvas.onmousemove = this.mouseMove.bind(this);
  this.canvas.onmousedown = this.mouseDown.bind(this);
  this.canvas.onmouseup = this.mouseUp.bind(this);

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
  this.mapName = "map69";
  this.mapBackgroundName = '';
  this.itemsByName = {};
  this.zoomBox = null;
  this.backgroundItems = [];

  var w = this.realWorldSize.w;
  var h = this.realWorldSize.h;

  console.log(w, h);
  $(this.canvas).css('width', w).css('height', h);
}


Map.prototype.startTick = function() {
  var now = new Date();
  this.tickStart = now.getTime();
  this.tickCount = 0;
  this.tick();
};

Map.prototype.drawBackground = function() {
  if(this.mapBackgroundName !== '') {
    var bg = this.itemsByName[this.mapBackgroundName];
    //    console.log(this.mapBackgroundName, 'bg', bg);
    if(!_.isUndefined(bg)) {
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

  this.drawBackground();

  //draw world border
  this.ctx.fillStyle = '00f';
  this.ctx.strokeRect(0, 0, this.realWorldSize.w, this.realWorldSize.h);


  this.ctx.translate(this.translate.x, this.translate.y);
  this.ctx.scale(this.scale, this.scale);


  for(var i in this.MapItems) {
    var item = this.MapItems[i];
    this.drawItem(item);
  }

  // draw selected Zone
  if(this.action == 'selectZone') {
    this.drawSelectedZone();
  }


  this.ctx.restore();


  if(this.zoomBox != null) {
    this.scale = this.realWorldSize.w * this.scale / this.zoomBox.w;
    this.translate.x = -this.zoomBox.x * this.scale;
    this.translate.y = -this.zoomBox.y * this.scale;
    this.zoomBox = null;
  }
};

Map.prototype.tick = function() {
  this.tickCount++;
  var debugoutput = [];
  var now = new Date();
  var tickDiff = now.getTime() - this.tickStart;
  //console.log(tickDiff);
  if(tickDiff > 1000) {
    $('#fps').html('fps:' + this.tickCount);
    this.tickCount = 0;
    this.tickStart = now.getTime();
  }
  requestAnimFrame(this.tick.bind(this));
  this.canvasDraw();

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
  //   if (this.action == 'translate'){
  //    this.translateSelectedItemsUsingMousePosition();
  //   }
};


function Step(items, action, callback) {
  var itemsLength = items.length;
  var itemCount = 0;

  function end() {
    if(itemCount === itemsLength - 1) {
      if(_.isFunction(callback)) {
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
  Step(items, function(item, end) {
    that.addItem(item, function(err, jsonItem) {
      that.itemsByName[jsonItem.name] = jsonItem;
      return end();
    });
  }, callback);
};

Map.prototype.addItem = function(itemName, callback) {
  var that = this;
  var items = $('#items');
  $.getJSON('/items/' + itemName + '.json', function(item) {
    //console.log(item);
    var itemID = 'item-' + item.name;
    var itemLi = $('<li class="item" id="' + itemID + '"></li>');
    var UL = $('<ul class="item-properties"/>');
    itemLi.append(UL);
    var demoDiv = $('<li class="kr-mm-demo"/>');
    switch(item.patternType) {
    case 'both':
      var bgItem = {
        'name': item.name,
        'path': item.image.path
      };
      that.backgroundItems.push(bgItem);
      //console.log(that.backgroundItems);
    case 'horizontal':
    case 'vertical':
      demoDiv.css('background-image', 'url("' + item.image.path + '")');
      break;
    default:
      demoDiv.append('<img class="kr-item-demo" src="' + item.image.path + '"/>');
    }
    demoDiv.addClass('kr-mm-demo-' + item.patternType);
    UL.append('<li class="kr-pp-item-name">' + item.name + '</li>');

    UL.append(demoDiv);
    items.append(itemLi);
    $('#' + itemID).click(function() {
      var now = new Date();
      var timestamp = now.getTime();
      that.MapItems[timestamp] = new MapItem(item, that.ctx, timestamp);
    });


    if(_.isFunction(callback)) {
      var mapItem = new MapItem(item, that.ctx, item.name);
      callback(null, mapItem);
    }
  });
};
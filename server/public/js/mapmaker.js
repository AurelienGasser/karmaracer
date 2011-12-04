var map;

function CanvasItem(_jsonItem, _canvasMap){
  this.jsonItem = _jsonItem;
  this.position = {"x" : 0, "y" : 0};
  this.size = {"w" : this.jsonItem.image.size, "h" : this.jsonItem.image.size};
  this.name = this.jsonItem.name;
  this.isSelected = false;
  this.canvasMap = _canvasMap;
  this.isPattern = this.jsonItem.isPattern;
  this.pattern;

  this.image = new Image();
  this.image.src = this.jsonItem.image.path;
  if (this.isPattern){
    this.image.onload = function(){
      this.pattern = this.canvasMap.ctx.createPattern(this.image,'repeat');
      console.log('pattern', this.pattern);
    }.bind(this);
  }
}

function MapCanvas(selector){
  this.canvas = $(selector)[0];

  this.ctx = this.canvas.getContext("2d");
  this.canvasItems = [];
  this.canvasMousePosition = {"x" : 0, "y" : 0};
  this.mouseDownPosition = {"x" : 0, "y" : 0};
  this.canvas.onmousemove = this.mouseMove.bind(this);
  this.canvas.onmousedown = this.mouseDown.bind(this);
  this.canvas.onmouseup = this.mouseUp.bind(this);

  this.keyPress = {
    shift: false
  };

  this.selectedZone = {"x" : 0, "y" : 0, "w" : 0, "h" : 0};
  this.keyboardHandler = new KeyboardHandlerMap(this);

  this.scale = 1;
  this.translate = {"x" : 0, "y" : 0};
  this.realWorldSize = {"w" : 800, "h" : 500};

  this.zoomBox = null;

  this.tick();
}

MapCanvas.prototype.scaleItemsUsingCanvasMouse = function() {
  var translateVector = {
    "x" : this.canvasMousePosition.x - this.mouseDownPosition.x,
    "y" : this.canvasMousePosition.y - this.mouseDownPosition.y,
  };
  this.ctx.fillStyle = '0f0';
  _.each(this.canvasItems, function(item){
    if (item.isSelected){
      item.size.w += translateVector.x;
      item.size.h += translateVector.y;
    }
    //this.ctx.fillRect(item.position.x, item.position.y, item.size.w, item.size.h);
  }.bind(this));
  this.mouseDownPosition = this.canvasMousePosition;
};

MapCanvas.prototype.zoomToSelectedItems = function() {
  var itemMostLeft;
  var itemMostRight;
  var itemMostTop;
  var itemMostBottom;
  var itemSelected = 0;
  _.each(this.canvasItems, function(item){
    if (item.isSelected){
      itemSelected++;
      if (typeof itemMostLeft === "undefined"){
        itemMostLeft = item;
      }
      if (typeof itemMostRight === "undefined"){
        itemMostRight = item;
      }
      if (typeof itemMostTop === "undefined"){
        itemMostTop = item;
      }
      if (typeof itemMostBottom === "undefined"){
        itemMostBottom = item;
      }
      if (item.position.x < itemMostLeft.position.x) itemMostLeft = item;
      if (item.position.x + item.size.w > itemMostRight.position.x + itemMostRight.size.w) itemMostRight = item;
      if (item.position.y < itemMostTop.position.y) itemMostTop = item;
      if (item.position.y + item.size.h > itemMostBottom.position.y + itemMostBottom.size.h) itemMostBottom = item;
    }
  }.bind(this));
  var margin = 20;
  if (itemSelected > 0){
    this.zoomBox = {"x" : itemMostLeft.position.x - margin, "y" : itemMostTop.position.y - margin, "w" : itemMostRight.position.x + itemMostRight.size.w - itemMostLeft.position.x + 2 * margin,  "h" : itemMostBottom.position.y + itemMostBottom.size.h - itemMostTop.position.y + 2 * margin};
  }
};

MapCanvas.prototype.drawItem = function(item) {
  //this.ctx.fillRect(item.position.x - item.size.w / 2, item.position.y - item.size.h / 2, item.size.w, item.size.h);
  if (item.isSelected){
    this.ctx.shadowOffsetX = 2;
    this.ctx.shadowOffsetY = 2;
    this.ctx.shadowBlur    = 4;
    this.ctx.shadowColor   = 'rgba(0, 0, 0, 0.5)';
  } else {
    this.ctx.shadowBlur    = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
  }
  if (item.isPattern) {
    this.ctx.fillStyle = item.pattern;
  } else {
     this.ctx.fillStyle = '0f0';
  }
  this.ctx.fillRect(item.position.x, item.position.y, item.size.w, item.size.h);
  if (item.isSelected) {
    this.ctx.fillStyle = '000';
    this.ctx.fillRect(item.position.x + item.size.w * 0.9, item.position.y + item.size.h * 0.9, item.size.w * 0.1, item.size.h * 0.1);
  }
}

MapCanvas.prototype.drawSelectedZone = function() {
  this.selectedZone.x = this.mouseDownPosition.x;
  this.selectedZone.y = this.mouseDownPosition.y;
  this.selectedZone.w = this.canvasMousePosition.x - this.mouseDownPosition.x;
  this.selectedZone.h = this.canvasMousePosition.y - this.mouseDownPosition.y;
  if (this.selectedZone.w < 0){
    this.selectedZone.x += this.selectedZone.w;
    this.selectedZone.w *= -1;
  }
  if (this.selectedZone.h < 0){
    this.selectedZone.y += this.selectedZone.h;
    this.selectedZone.h *= -1;
  }
  this.ctx.strokeStyle = 'f00';
  this.ctx.strokeRect( this.selectedZone.x, this.selectedZone.y, this.selectedZone.w, this.selectedZone.h);
}

MapCanvas.prototype.canvasDraw = function() {
  this.ctx.canvas.width = $(this.canvas).width();
  this.ctx.canvas.height = $(this.canvas).height();

  //this.camera.update({"x" : this.camera.scaledSized.w / 2, "y" : this.camera.scaledSized.h / 2});

  this.ctx.translate(this.translate.x, this.translate.y);
  this.ctx.scale(this.scale, this.scale);

  this.ctx.fillStyle = '00f';
  this.ctx.strokeRect(0, 0, this.realWorldSize.w, this.realWorldSize.h);

  // if (this.zoomBox != null){
  //   this.ctx.fillRect(this.zoomBox.x, this.zoomBox.y, this.zoomBox.w, this.zoomBox.h);
  // }

  _.each(this.canvasItems, this.drawItem.bind(this));

  // draw selected Zone
  if (this.action == 'selectZone') {
    this.drawSelectedZone();
  }

  if (this.zoomBox != null) {
    this.scale = this.realWorldSize.w * this.scale / this.zoomBox.w;
    this.translate.x = -this.zoomBox.x * this.scale;
    this.translate.y = -this.zoomBox.y * this.scale;
    this.zoomBox = null;
  }
  // if (this.selectedItem != null){
  //   this.ctx.strokeStyle = 'f00';
  //   this.ctx.beginPath();
  //   this.ctx.moveTo(this.selectedItem.position.x + this.sel, this.selectedItem.position.y);
  //   this.ctx.lineTo(this.canvasMousePosition.x, this.canvasMousePosition.y);
  //   this.ctx.closePath();
  //   this.ctx.stroke();
  // }
};

MapCanvas.prototype.tick = function() {
  requestAnimFrame(this.tick.bind(this));
  this.canvasDraw();

  var debugoutput = [];
  debugoutput.push('<li>Canvas Mouse Pos : ', this.canvasMousePosition.x, ', ', this.canvasMousePosition.y ,'</li>');
  debugoutput.push('<li>Canvas Down Pos : ', this.mouseDownPosition.x, ', ', this.mouseDownPosition.y ,'</li>');

  debugoutput.push('<li>Action : ', this.action ,'</li>');
  debugoutput.push('<li>ScaleCanvas : ', this.scale ,'</li>');
  debugoutput.push('<li>TranslateCanvas : ', this.translate.x, ', ', this.translate.y ,'</li>');

  debugoutput.push('<li>--------</li>');
  debugoutput.push('<li>Help</li>');
  debugoutput.push('<li>Arrows (move canvas)</li>');
  debugoutput.push('<li>R (release items)</li>');
  debugoutput.push('<li>P/L (zoom/unzoom)</li>');
  debugoutput.push('<li>S (set scale to 1)</li>');
  debugoutput.push('<li>Z (zoom to selected items)</li>');

  $("#canvas-debug").html(debugoutput.join(''));
  if (this.action == 'translate'){
    this.moveSelectedItemsUsingMousePosition();
  }
};

MapCanvas.prototype.moveSelectedItemsUsingMousePosition = function() {
  var translateVector = {
    "x" : this.canvasMousePosition.x - this.mouseDownPosition.x,
    "y" : this.canvasMousePosition.y - this.mouseDownPosition.y,
  };
  _.each(this.canvasItems, function(item){
      if (item.isSelected == false) return;
      item.position = {
        "x" : item.position.x + translateVector.x,
        "y" : item.position.y + translateVector.y
      };
  }.bind(this));
  this.mouseDownPosition = this.canvasMousePosition;
};

MapCanvas.prototype.mouseMove = function(e) {
  this.canvasMousePosition = {
    "x" : e.pageX - this.canvas.offsetLeft - this.translate.x,
    "y" : e.pageY - this.canvas.offsetTop - this.translate.y
  };
  this.canvasMousePosition.x *= 1 / this.scale;
  this.canvasMousePosition.y *= 1 / this.scale;
  // left click is pressed
  if (e.button == 0 && e.which == 1) {
    switch (this.action) {
      case 'translate':
        this.moveSelectedItemsUsingMousePosition();
        break;
      case 'scale':
        this.scaleItemsUsingCanvasMouse();
        break;
    }
  }
};

MapCanvas.prototype.releaseItems = function() {
  _.each(this.canvasItems, function(item){
    item.isSelected = false;
  }.bind(this));
};

MapCanvas.prototype.mouseUp = function(e) {
  if (this.action == 'selectZone'){
    this.selectItemsInSelectedZone();
  }
  this.action = '';
}

MapCanvas.prototype.mouseDownInItemScaleZone = function(item, scaleZonePercentage) {
  if (this.canvasMousePosition.x < item.position.x + item.size.w * scaleZonePercentage) return false;
  if (this.canvasMousePosition.x > item.position.x + item.size.w) return false;
  if (this.canvasMousePosition.y < item.position.y + item.size.h * scaleZonePercentage) return false;
  if (this.canvasMousePosition.y > item.position.y + item.size.h) return false;
  return true;
};

MapCanvas.prototype.mouseDown = function(e) {
  //this.actionTranslate = false;
  this.mouseDownPosition = this.canvasMousePosition;
  _.each(this.canvasItems, function(item) {
    if (this.isMousePositionInItem(item)) {
      item.isSelected = true;
      if (this.mouseDownInItemScaleZone(item, 0.9)){
        this.action = 'scale';
      } else {
        this.action = 'translate';
      }
      throw "break";
    }
  }.bind(this));
  if (this.action != 'translate' && this.action != 'scale'){
    this.releaseItems();
    this.action = 'selectZone';
  }
};

MapCanvas.prototype.selectItemsInSelectedZone = function() {
  _.each(this.canvasItems, function(item){
    if (item.position.x < this.selectedZone.x) return;
    if (item.position.y < this.selectedZone.y) return;
    if (item.position.x + item.size.w > this.selectedZone.x + this.selectedZone.w) return;
    if (item.position.y + item.size.h > this.selectedZone.y + this.selectedZone.h) return;
    item.isSelected = true;
  }.bind(this));
};

MapCanvas.prototype.isMousePositionInItem = function(item) {
  if (this.canvasMousePosition.x < item.position.x) return false;
  if (this.canvasMousePosition.x > item.position.x + item.size.w) return false;
  if (this.canvasMousePosition.y < item.position.y) return false;
  if (this.canvasMousePosition.y > item.position.y + item.size.h) return false;
  return true;
};

$(function(){
  G_map = new MapCanvas("#map-canvas");
  //console.log('map loaded');
  G_map.addItem('wall');
  G_map.addItem('stone');
  G_map.addItem('grass');
  G_map.addItem('stone_l');
  G_map.addItem('stone_r');

});

MapCanvas.prototype.addItem = function(itemName) {
  var items = $('#items');
  $.getJSON('/items/' + itemName + '.json', function(item){
    //console.log(item);
    var itemID = 'item-' + item.name;
    items.append('<li class="item" id="' + itemID + '">' + item.name+  '</li>');
    $('#' + itemID).click(function(){
      this.canvasItems.push(new CanvasItem(item, this));
    }.bind(this));
  }.bind(this))
};

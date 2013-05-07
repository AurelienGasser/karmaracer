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
  if(this.mapBackgroundName !== '') {
    var bg = this.itemsByName[this.mapBackgroundName];
    if(!KLib.isUndefined(bg)) {
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


  for(var i in this.MapItems) {
    var item = this.MapItems[i];
    this.canvasDrawItem(item);
  }

  // draw selected Zone
  if(this.action == 'selectZone') {
    this.canvasDrawSelectedZone();
  }


  this.ctx.restore();


  if(this.zoomBox != null) {
    this.scale = this.realWorldSize.w * this.scale / this.zoomBox.w;
    this.translate.x = -this.zoomBox.x * this.scale;
    this.translate.y = -this.zoomBox.y * this.scale;
    this.zoomBox = null;
  }
};

Map.prototype.canvasDrawItem = function(item) {

  var isItemSelected = _.include(this.selectedItems, item.id);

  if(isItemSelected) {
    this.ctx.shadowOffsetX = 2;
    this.ctx.shadowOffsetY = 2;
    this.ctx.shadowBlur = 4;
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  } else {
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
  }
  if(item.patternType !== "none") {
    this.ctx.fillStyle = item.pattern;
    this.ctx.save();
    this.ctx.translate(item.position.x, item.position.y);
    this.ctx.fillRect(0, 0, item.size.w, item.size.h);
    this.ctx.restore();
  } else {
    this.ctx.drawImage(item.image, item.position.x, item.position.y, item.size.w, item.size.h);
  }
  if(isItemSelected) {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(item.position.x + item.size.w * 0.8, item.position.y + item.size.h * 0.8, item.size.w * 0.2, item.size.h * 0.2);
  }
}

Map.prototype.canvasDrawSelectedZone = function() {
  this.selectedZone.x = this.mouseDownPosition.x;
  this.selectedZone.y = this.mouseDownPosition.y;
  this.selectedZone.w = this.canvasMousePosition.x - this.mouseDownPosition.x;
  this.selectedZone.h = this.canvasMousePosition.y - this.mouseDownPosition.y;
  if(this.selectedZone.w < 0) {
    this.selectedZone.x += this.selectedZone.w;
    this.selectedZone.w *= -1;
  }
  if(this.selectedZone.h < 0) {
    this.selectedZone.y += this.selectedZone.h;
    this.selectedZone.h *= -1;
  }
  this.ctx.strokeStyle = 'f00';
  this.ctx.strokeRect(this.selectedZone.x, this.selectedZone.y, this.selectedZone.w, this.selectedZone.h);
}
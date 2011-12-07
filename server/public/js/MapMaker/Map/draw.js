
Map.prototype.drawItem = function(item) {

 var isItemSelected = _.include(this.selectedItems, item.id);

  if (isItemSelected){
    this.ctx.shadowOffsetX = 2;
    this.ctx.shadowOffsetY = 2;
    this.ctx.shadowBlur    = 4;
    this.ctx.shadowColor   = 'rgba(0, 0, 0, 0.5)';
  } else {
    this.ctx.shadowBlur    = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
  }
  if (item.patternType != "none") {
    this.ctx.fillStyle = item.pattern;
    this.ctx.save();
    this.ctx.translate(item.position.x, item.position.y);
    this.ctx.fillRect(0, 0, item.size.w, item.size.h);
    this.ctx.restore();
  } else {
    this.ctx.drawImage(item.image, item.position.x, item.position.y, item.size.w, item.size.h);
  }
  if (isItemSelected){
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(item.position.x + item.size.w * 0.8, item.position.y + item.size.h * 0.8, item.size.w * 0.2, item.size.h * 0.2);
  }
}

Map.prototype.drawSelectedZone = function() {
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

function Camera(ctx, _canvasSelector){
  this.ctx = ctx;
  this.translate = {"x" : 0, "y" : 0};
  this.center = {"x" : 0, "y" : 0};
  this.scale = 1.2;
  this.realWorldSize = {"w" : 0, "h" : 0};
  this.canvasSelector = _canvasSelector;

}

Camera.prototype.setWorldSize = function(realWorldSize) {
  this.realWorldSize = realWorldSize;
  var canvasSize = this.getCanvasSize();
  this.scaledSized = {w : canvasSize.w * this.scale, h : canvasSize.h * this.scale};
  this.scaleLimits = {min : 0.1, max : 5};
};

Camera.prototype.updateScale = function (){
  var screenRatio = this.getScreenRatio();
};

Camera.prototype.getCanvasSize = function() {
  return {w : this.ctx.canvas.width, h : this.ctx.canvas.height};
};

Camera.prototype.resizeCanvas = function(newSize){
  if (this.ctx !== null){
    this.ctx.canvas.width = newSize.w;
    this.ctx.canvas.height = newSize.h;
    $(this.canvasSelector).width(newSize.w);
    $(this.canvasSelector).height(newSize.h);
  }
};

Camera.prototype.getScreenRatio = function(){
  var canvasSize = this.getCanvasSize();
  var ratioX = canvasSize.w / this.realWorldSize.w;
  var ratioY = canvasSize.h / this.realWorldSize.h;
  if (ratioX < ratioY) return ratioX;
  return ratioY;
};

Camera.prototype.drawDebug = function() {
  var canvasSize = this.getCanvasSize();
  var cameraDebug = [];
  cameraDebug.push('<ul>');
  cameraDebug.push('<li>', 'Canvas Size : ', canvasSize.w, ', ', canvasSize.h, '</li>');
  cameraDebug.push('<li>', 'Translate X : ', this.translate.x, '</li>');
  cameraDebug.push('<li>', 'Translate Y : ', this.translate.y, '</li>');
  cameraDebug.push('<li>', 'Scale : ', this.scale, '</li>');
  cameraDebug.push('<li>', 'Scaled Size : ', this.scaledSized.w, ', ', this.scaledSized.h, '</li>');
  cameraDebug.push('<li>', 'myCar Pos : ', this.center.x, ', ', this.center.y, ', r°:', this.center.r,'</li>');
  cameraDebug.push('<li>', 'Orientation : ',  window.orientation ,'</li>');
  if (window.orientation !== null){
  }
  cameraDebug.push('</ul>');
  $('#camera-debug').html(cameraDebug.join(''));
};

Camera.prototype.update = function(center) {
  //if (center == null) return;
  if (typeof center !== "undefined"){
    this.center = center;
  }
  this.updateScale();
  var canvasSize = this.getCanvasSize();
  this.scaledSized = {w : canvasSize.w / (this.scale), h : canvasSize.h / (this.scale)};
  this.translate.x = this.scaledSized.w / 2 - this.center.x;
  this.translate.y = this.scaledSized.h / 2 - this.center.y;

  // scale the canvas & make the horizontal mirror
  this.ctx.scale(this.scale, this.scale);
  // translate to center the car
  this.ctx.translate(this.translate.x, this.translate.y);
  //this.drawDebug();
};

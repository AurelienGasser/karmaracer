
Map.prototype.saveMap = function() {

  var iWidth =  this.realWorldSize.w;
  var iHeight = this.realWorldSize.h;

  this.canvas.toDataURL("image/png");
}

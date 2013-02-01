
function MapItem(_jsonItem, _ctx, _id){
  this.id = _id;
  this.jsonItem = _jsonItem;
  this.position = {"x" : 0, "y" : 0};
  this.size = {"w" : this.jsonItem.image.size, "h" : this.jsonItem.image.size};
  this.name = this.jsonItem.name;
  this.patternType = this.jsonItem.patternType;
  this.pattern;
  this.zIndex = 0;

  this.image = new Image();
  this.image.src = this.jsonItem.image.path;
  this.image.crop = this.jsonItem.image.crop;
  if (this.patternType !== "none"){
    this.image.onload = function(){
      this.pattern = _ctx.createPattern(this.image, 'repeat');
    }.bind(this);
  }
}


MapItem.prototype.scale = function(canvasMousePosition, scaleMousePosition, keyPress) {
    var translateVector;
    var diffx = canvasMousePosition.x - scaleMousePosition.x;
    var diffy = canvasMousePosition.y - scaleMousePosition.y;
    if (keyPress.shift) {
      var min = Math.min(diffx, diffy);
      translateVector = {
        "x" : min,
        "y" : min,
      };
    } else {
      translateVector = {
        "x" : diffx,
        "y" : diffy,
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
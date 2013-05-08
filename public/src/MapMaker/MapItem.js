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
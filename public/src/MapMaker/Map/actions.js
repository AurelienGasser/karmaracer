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

}(Karma.Map || {}));
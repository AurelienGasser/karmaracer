(function(Map) {
  "use strict";


  Map.prototype.zoomToSelectedItems = function() {
    var itemMostLeft;
    var itemMostRight;
    var itemMostTop;
    var itemMostBottom;
    _.each(this.selectedItems, function(id) {
      var item = this.MapItems[id];
      if (typeof itemMostLeft === "undefined") {
        itemMostLeft = item;
      }
      if (typeof itemMostRight === "undefined") {
        itemMostRight = item;
      }
      if (typeof itemMostTop === "undefined") {
        itemMostTop = item;
      }
      if (typeof itemMostBottom === "undefined") {
        itemMostBottom = item;
      }
      if (item.position.x < itemMostLeft.position.x) itemMostLeft = item;
      if (item.position.x + item.size.w > itemMostRight.position.x + itemMostRight.size.w) itemMostRight = item;
      if (item.position.y < itemMostTop.position.y) itemMostTop = item;
      if (item.position.y + item.size.h > itemMostBottom.position.y + itemMostBottom.size.h) itemMostBottom = item;
    }.bind(this));
    var margin = 20;
    if (this.selectedItems.length > 0) {
      this.zoomBox = {
        "x": itemMostLeft.position.x - margin,
        "y": itemMostTop.position.y - margin,
        "w": itemMostRight.position.x + itemMostRight.size.w - itemMostLeft.position.x + 2 * margin,
        "h": itemMostBottom.position.y + itemMostBottom.size.h - itemMostTop.position.y + 2 * margin
      };
    }
  };

  Map.prototype.mouseDownInItemScaleZone = function(item, scaleZonePercentage) {
    if (this.canvasMousePosition.x < item.position.x + item.size.w * scaleZonePercentage) return false;
    if (this.canvasMousePosition.x > item.position.x + item.size.w) return false;
    if (this.canvasMousePosition.y < item.position.y + item.size.h * scaleZonePercentage) return false;
    if (this.canvasMousePosition.y > item.position.y + item.size.h) return false;
    return true;
  };


  Map.prototype.selectItemsInSelectedZone = function() {
    _.each(this.MapItems, function(item) {
      if (item.position.x < this.selectedZone.x) return;
      if (item.position.y < this.selectedZone.y) return;
      if (item.position.x + item.size.w > this.selectedZone.x + this.selectedZone.w) return;
      if (item.position.y + item.size.h > this.selectedZone.y + this.selectedZone.h) return;
      this.selectItem(item.id);
    }.bind(this));
  };

  Map.prototype.isMousePositionInItem = function(item) {
    if (this.canvasMousePosition.x < item.position.x) return false;
    if (this.canvasMousePosition.x > item.position.x + item.size.w) return false;
    if (this.canvasMousePosition.y < item.position.y) return false;
    if (this.canvasMousePosition.y > item.position.y + item.size.h) return false;
    return true;
  };


  Map.prototype.deselectAllItems = function() {
    for (var id in this.itemsGlow) {
      this.deselectItem(id);
    }
    this.selectedItems = [];
  };

  Map.prototype.isItemSelected = function(id) {
    return _.include(this.selectedItems, id);
  };

  Map.prototype.selectItem = function(id, rect) {
    this.selectedItems.push(id);

    if (!KLib.isUndefined(rect)) {
      rect.isSelected = true;
      this.itemsGlow[id] = rect;
      $(rect).attr('stroke', '#000');
      $(rect.rectSelected).show();
    }

  };

  Map.prototype.deselectItem = function(id) {
    this.selectedItems.splice(this.selectedItems.indexOf(id), 1);
    var rect = this.itemsGlow[id];
    if (!KLib.isUndefined(rect)) {
      rect.isSelected = false;
      $(rect.rectSelected).hide();
      $(rect).attr('stroke', 'transparent');
    }
  };

}(Karma.Map));
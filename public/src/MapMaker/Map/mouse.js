(function(Map) {
  "use strict";

  Map.prototype.mouseDown = function() {
    this.mouseDownPosition = this.canvasMousePosition;
    this.action = '';
    if (this.keyPress.shift) {
      _.each(this.MapItems, function(item) {
        if (this.isMousePositionInItem(item)) {
          if (this.isItemSelected(item.id)) {
            this.deselectItem(item.id);
          } else {
            this.selectItem(item.id);
          }
        }
      }.bind(this));
    } else {
      _.each(this.MapItems, function(item) {
        if (this.isMousePositionInItem(item)) {
          if (!this.isItemSelected(item.id)) {
            this.deselectAllItems();
            this.selectItem(item.id);
          }
          this.mouseDownOnItem = item;
          if (this.mouseDownInItemScaleZone(item, 0.8)) {
            this.startScaling();
          } else {
            this.startTranslating();
          }
        }
      }.bind(this));
      if (this.action != 'translate' && this.action != 'scale') {
        this.deselectAllItems();
        this.action = 'selectZone';
      }
    }
  };

  Map.prototype.mouseMove = function(e) {
    this.canvasMousePosition = {
      "x": e.pageX - this.canvas.offsetLeft - this.translate.x,
      "y": e.pageY - this.canvas.offsetTop - this.translate.y
    };
    this.canvasMousePosition.x *= 1 / this.scale;
    this.canvasMousePosition.y *= 1 / this.scale;
    var scale_cursor = 's-resize';
    if (this.action == 'scale') {
      document.body.style.cursor = scale_cursor;
    } else {
      var inScaleZone = false;
      _.each(this.MapItems, function(item) {
        if (inScaleZone) {
          return;
        }
        if (this.mouseDownInItemScaleZone(item, 0.9)) {
          // cursor over scale zome
          inScaleZone = true;
        }
      }.bind(this));
      if (inScaleZone) {
        document.body.style.cursor = scale_cursor;
      } else {
        document.body.style.cursor = 'default';
      }
    }
    // left click is pressed
    if (e.button === 0 && e.which === 1) {
      switch (this.action) {
        case 'translate':
          this.translateSelectedItemsUsingMousePosition();
          break;
        case 'scale':
          this.scaleItemsUsingCanvasMouse();
          break;
      }
    }
  };

  Map.prototype.mouseUp = function() {
    switch (this.action) {
      case 'selectZone':
        this.selectItemsInSelectedZone();
        break;
      case 'scale':
      case 'translate':
        break;
      default:
        break;
    }
    this.action = '';
  };

}(Karma.Map));
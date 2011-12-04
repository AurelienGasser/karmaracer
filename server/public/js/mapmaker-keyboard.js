function KeyboardHandlerMap(_canvasMap) {
  this.canvasMap = _canvasMap;
  document.onkeydown = this.handleKeyDown.bind(this);
  document.onkeyup = this.handleKeyUp.bind(this);
};

KeyboardHandlerMap.prototype.handleKey = function(key, state) {
  switch (key) {
    case 37: // left arrow
      this.canvasMap.translate.x += 5;
      break;
    case 39: // right arrow
      this.canvasMap.translate.x -= 5;
      break;
    case 38: // up arrow
      this.canvasMap.translate.y += 5;
      break;
    case 40: // down arrow
      this.canvasMap.translate.y -= 5;
      break;
    case 90: // Z
      if (!state) break;
      this.canvasMap.zoomToSelectedItems();
      break;
    case 83: // S
      if (!state) break;
      this.canvasMap.scale = 1;
      this.canvasMap.translate = {"x" : 0, "y" : 0};
      break;
    case 76: // L
      if (!state) break;
      this.canvasMap.scale *= 1.1;
      break;
    case 77: // M
      this.canvasMap.actionTranslate = state;
      if (state){
        this.canvasMap.mouseDownPosition = this.canvasMap.canvasMousePosition;
      }
      break;
    case 80: // P
      if (!state) break;
      this.canvasMap.scale *= 0.9;
      break;
    case 82: // R
      //console.log('release items');
      if (state){
        this.canvasMap.releaseItems();  
      }
      
      break;

    default :
      console.log(key);
  }
}

KeyboardHandlerMap.prototype.handleKeyDown = function(event) {
  this.handleKey(event.keyCode, true);
}

KeyboardHandlerMap.prototype.handleKeyUp = function(event) {
  this.handleKey(event.keyCode, false);
}


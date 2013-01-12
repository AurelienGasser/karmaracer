function KeyboardHandler(gameInstance) {
  this.gameInstance = gameInstance;
  return this;
};

KeyboardHandler.prototype.event = function(event, state) {
  var connection = this.gameInstance.socketManager.getConnection();
  if (connection) {
    $('#touch-debug').html(event + ' ' + state);
    var eventToSend = {};
    eventToSend[event] = state;
    connection.emit('drive', eventToSend);
  }
}

KeyboardHandler.prototype.handleKey = function(key, state) {
  //console.log(key);
  switch (key) {
    case 32: // space
      this.event('shoot', state);
      break;
    case 37: // left arrow
      this.event('left', state);
      break;
    case 39: // right arrow
      this.event('right', state);
      break;
    case 38: // up arrow
      this.event('forward', state);
      break;
    case 40: // down arrow
      this.event('backward', state);
      break;
    case 76: // L
      this.gameInstance.drawEngine.camera.scale *= 1.05;
      break;
    case 80: // P
      this.gameInstance.drawEngine.camera.scale *= 0.95;
      break;
    default :
      //console.log(key);
  }
}

KeyboardHandler.prototype.handleKeyDown = function(event) {
  if (!($('#chat_input').is(':focus'))) {
    this.handleKey(event.keyCode, 'start')
  }
}

KeyboardHandler.prototype.handleKeyUp = function(event) {
  switch (event.keyCode) {
    case 13:
      if (!($('#chat_input').is(':focus'))) {
        showChat();
      } else {
        sendMsg();
      }
      break;
    default:
      if (!($('#chat_input').is(':focus'))) {
        this.handleKey(event.keyCode, 'end');
      }
      break;
    }
}


KEY_ENTER = 13;
KEY_SPACE = 32;
KEY_LEFT = 37;
KEY_RIGHT = 39;
KEY_UP = 38;
KEY_DOWN = 40;
KEY_ESCAPE = 27;
KEY_L = 76;
KEY_P = 80;

function KeyboardHandler(gameInstance) {
  this.gameInstance = gameInstance;
  this.events = {};
  setInterval(this.sendKeyboardEvents.bind(this), 1000 / 16);
  return this;
};

KeyboardHandler.prototype.event = function(event, state) {

  this.events[event] = state;
}

KeyboardHandler.prototype.sendKeyboardEvents = function() {
  if (Object.keys(this.events).length === 0){
    // dont send;
    return false;
  }
  var connection = this.gameInstance.socketManager.getConnection();
  if(connection) {
    connection.emit('drive', this.events);
  }
  this.events = {};
};

KeyboardHandler.prototype.handleKey = function(key, state) {
  switch(key) {
  case KEY_SPACE:
    this.event('shoot', state);
    break;
  case KEY_LEFT:
    this.event('left', state);
    break;
  case KEY_RIGHT:
    this.event('right', state);
    break;
  case KEY_UP:
    this.event('forward', state);
    break;
  case KEY_DOWN:
    this.event('backward', state);
    break;
  case KEY_L:
    if (state == 'start') {
      this.gameInstance.drawEngine.camera.scale *= 1.05;
    }
    break;
  case KEY_P:
    if (state == 'start') {
      this.gameInstance.drawEngine.camera.scale *= 0.95;
    }
    break;
  default:
    //console.log(key);
  }
}

KeyboardHandler.prototype.handleKeyDown = function(event) {
  switch(event.keyCode) {
  case KEY_ESCAPE:
    clearChatInputField();
    hideChat();
    break;
  case KEY_UP:
  case KEY_DOWN:
    if ($('#chat_input').is(':focus')) {
      hideChat();
    }
    this.handleKey(event.keyCode, 'start')
    break;
  case KEY_ENTER:
    if ($('#chat_input').is(':focus')) {
      sendMsg();
    } else {
      showChat();
    }
    break;
  case KEY_L:
  case KEY_P:
  case KEY_SPACE:
    if (!$('#chat_input').is(':focus')) {
      this.handleKey(event.keyCode, 'start');
    }
    break;
  default:
    this.handleKey(event.keyCode, 'start')
  }
}

KeyboardHandler.prototype.handleKeyUp = function(event) {
  this.handleKey(event.keyCode, 'end');
}
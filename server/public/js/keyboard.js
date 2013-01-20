KEY_ENTER = 13;
KEY_SPACE = 32;
KEY_LEFT = 37;
KEY_RIGHT = 39;
KEY_UP = 38;
KEY_DOWN = 40;
KEY_ESCAPE = 27;

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

  //console.log(key);
  switch(key) {
  case KEY_SPACE:
    // space
    this.event('shoot', state);
    break;
  case KEY_LEFT:
    // left arrow
    this.event('left', state);
    break;
  case KEY_RIGHT:
    // right arrow
    this.event('right', state);
    break;
  case KEY_UP:
    // up arrow
    this.event('forward', state);
    break;
  case KEY_DOWN:
    // down arrow
    this.event('backward', state);
    break;
  case 76:
    // L
    this.gameInstance.drawEngine.camera.scale *= 1.05;
    break;
  case 80:
    // P
    this.gameInstance.drawEngine.camera.scale *= 0.95;
    break;
  default:
    //console.log(key);
  }
}

KeyboardHandler.prototype.handleKeyDown = function(event) {
  if($('#chat_input').is(':focus')) {
    if([KEY_ESCAPE, KEY_UP, KEY_DOWN].indexOf(event.keyCode) !== -1) {
      if(event.keyCode === KEY_ESCAPE) {
        clearChatInputField();
      }
      hideChat();
    }
  }
  this.handleKey(event.keyCode, 'start')
}

KeyboardHandler.prototype.handleKeyUp = function(event) {
  switch(event.keyCode) {
  case KEY_ENTER:
    if(!($('#chat_input').is(':focus'))) {
      showChat();
    } else {
      sendMsg();
    }
    break;
  default:
    if(!($('#chat_input').is(':focus'))) {
      this.handleKey(event.keyCode, 'end');
    }
    break;
  }
}
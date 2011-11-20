function KeyboardHandler() {
  this.eventsToEmit = {};
  setInterval(this.tick.bind(this), 5);
  return this;
};

KeyboardHandler.prototype.tick = function() {
  var connection = G_game.socketManager.getConnection();
  if (connection && !$.isEmptyObject(this.eventsToEmit)){
    $('#touch-debug').html(this.eventsToEmit);
    connection.emit('drive', this.eventsToEmit);
    this.eventsToEmit = {};
  }
}

KeyboardHandler.prototype.event = function(event, state) {
  this.eventsToEmit[event] = state;
}

KeyboardHandler.prototype.handleKey = function(key, state) {
  switch (key) {
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
  }
}

KeyboardHandler.prototype.handleKeyDown = function(event) {
  if (!($('#chat_input').is(':focus'))) {
    this.handleKey(event.keyCode, 'start')
  }
}

KeyboardHandler.prototype.handleKeyUp = function(event) {
  if (!($('#chat_input').is(':focus'))) {
    this.handleKey(event.keyCode, 'end');
  } else if (event.keyCode == 13){
    sendMsg();
  }
}


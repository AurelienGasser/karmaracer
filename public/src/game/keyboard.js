(function() {
  "use strict";

  var KEY_ENTER = 13,
    KEY_SPACE = 32,
    KEY_LEFT = 37,
    KEY_RIGHT = 39,
    KEY_UP = 38,
    KEY_DOWN = 40,
    KEY_ESCAPE = 27,
    KEY_L = 76,
    KEY_P = 80,
    KEY_B = 66;

  function KeyboardHandler(gameInstance) {
    this.gameInstance = gameInstance;
    return this;
  }

  KeyboardHandler.prototype.sendKeyboardEvent = function(event, state) {
    if (this.gameInstance.socketManager.getConnection()) {
      this.gameInstance.socketManager.getConnection().emit('drive', event, state);
    }
  };


  KeyboardHandler.prototype.handleKey = function(key, state) {
    switch (key) {
      case KEY_B:
        this.sendKeyboardEvent('break', state);
        break;
      case KEY_SPACE:
        this.sendKeyboardEvent('shoot', state);
        break;
      case KEY_LEFT:
        this.sendKeyboardEvent('left', state);
        break;
      case KEY_RIGHT:
        this.sendKeyboardEvent('right', state);
        break;
      case KEY_UP:
        this.sendKeyboardEvent('forward', state);
        break;
      case KEY_DOWN:
        this.sendKeyboardEvent('backward', state);
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
        e.preventDefault();
    }
  };

  KeyboardHandler.prototype.handleKeyDown = function(event) {
    switch (event.keyCode) {
      case KEY_ESCAPE:
        Karma.Chat.clearChatInputField();
        Karma.Chat.hideChat();
        break;
      case KEY_UP:
      case KEY_DOWN:
        if ($('#chat_input').is(':focus')) {
          Karma.Chat.hideChat();
        }
        this.handleKey(event.keyCode, 'start');
        break;
      case KEY_ENTER:
        if ($('#chat_input').is(':focus')) {
          Karma.Chat.sendMsg();
        } else {
          Karma.Chat.showChat();
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
        this.handleKey(event.keyCode, 'start');
    }
    event.preventDefault();
    return false;
  };

  KeyboardHandler.prototype.handleKeyUp = function(event) {
    this.handleKey(event.keyCode, 'end');
  };

  Karma.KeyboardHandler = KeyboardHandler;
}());
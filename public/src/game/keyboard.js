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
    KEY_B = 66,
    KEY_S = 83;

  function KeyboardHandler(gameInstance) {
    this.gameInstance = gameInstance;
    return this;
  }

  KeyboardHandler.prototype.sendKeyboardEvent = function(event, state) {
    if (this.gameInstance.socketManager.getConnection()) {
      this.gameInstance.socketManager.getConnection().emit('drive', event, state);
    }
    this.useKeyboardCommand(event, state);
  };

  KeyboardHandler.prototype.useKeyboardCommand = function(event, state) {
    switch (event) {
      case 'break':
        break;
      case 'shoot':
        if (state === 'start') {
          this.gameInstance.localCar.shootingWithWeapon = true;
        } else {
          this.gameInstance.localCar.shootingWithWeapon = false;
        }
        break;
      case 'left':
        break;
      case 'right':
        break;
      case 'forward':
        break;
      case 'backward':
        break;
      default:
        console.log('Error: Could not use keyboard command ' + event);
        break;
    }
  };

  KeyboardHandler.prototype.handleKey = function(key, state) {
    switch (key) {
      case KEY_B:
        this.sendKeyboardEvent('break', state);
        break;
      case KEY_SPACE:
      case KEY_S:
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
        return false; // return false when no catch
    }
    return true; // return true when the key is effectively catched
  };

  KeyboardHandler.prototype.handleKeyDownGame = function(event) {
    var preventDefault = false;
    switch (event.keyCode) {
      case KEY_ESCAPE:
        break;
      case KEY_UP:
      case KEY_DOWN:
        preventDefault = this.handleKey(event.keyCode, 'start');
        break;
      case KEY_ENTER:
        if (this.gameInstance.chat.isOpen === false) {
          preventDefault = this.gameInstance.chat.showChat();
        }
        break;
      case KEY_L:
      case KEY_P:
      case KEY_SPACE:
        preventDefault = this.handleKey(event.keyCode, 'start');
        break;
      default:
        preventDefault = this.handleKey(event.keyCode, 'start');
    }
    if (preventDefault) {
      event.preventDefault();
    }
    return !preventDefault;
  };

  KeyboardHandler.prototype.handleKeyDownChat = function(event) {
    switch (event.keyCode) {
      case KEY_UP:
        this.gameInstance.chat.hideChat();
        break;
      case KEY_DOWN:
        this.gameInstance.chat.hideChat();
        break;
      case KEY_ESCAPE:
        this.gameInstance.chat.clearChatInputField();
        this.gameInstance.chat.hideChat();
        break;
      case KEY_ENTER:
        if (this.gameInstance.chat.isOpen === true) {
          this.gameInstance.chat.sendMsg();
        } else {
          this.gameInstance.chat.showChat();
        }
        break;
    }
  };

  KeyboardHandler.prototype.handleKeyDown = function(event) {


    if (this.gameInstance.chat.isOpen === true) {
      return this.handleKeyDownChat(event);
    } else {
      var $pn = $('#playerName');
      if ($pn.is(':focus')) {
        return;
      } else {
        return this.handleKeyDownGame(event);
      }
    }
  };

  KeyboardHandler.prototype.handleKeyUp = function(event) {
    this.handleKey(event.keyCode, 'end');
  };

  Karma.KeyboardHandler = KeyboardHandler;
}());
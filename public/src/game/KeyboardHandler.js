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
    KEY_S = 83,
    KEY_D = 68,
    KEY_0 = 48,
    KEY_1 = 49,
    KEY_2 = 50,
    KEY_3 = 51,
    KEY_4 = 52,
    KEY_5 = 53,
    KEY_6 = 54,
    KEY_7 = 55,
    KEY_8 = 56,
    KEY_9 = 57,
  KEY_SHIFT = 16;

  function KeyboardHandler(gameInstance) {
    this.gameInstance = gameInstance;
    this.forward = false;
    this.backward = false;
    this.left = false;
    this.right = false;
    this.shoot = false;
    var that = this;
    return this;
  }

  KeyboardHandler.prototype.handleKey = function(key, state) {
    var now = Date.now();
    var ucm = this.gameInstance.userCommandManager;
    switch (key) {
      case KEY_1:
        this.gameInstance.drawEngine.camera.x -= 1;
        break;
      case KEY_2:
        this.gameInstance.drawEngine.camera.x += 1;
        break;
      case KEY_3:
        this.gameInstance.drawEngine.camera.y -= 1;
        break;
      case KEY_4:
        this.gameInstance.drawEngine.camera.y += 1;
        break;
      case KEY_5:
        this.gameInstance.drawEngine.camera.z -= 1;
        break;
      case KEY_6:
        this.gameInstance.drawEngine.camera.z += 1;
        break;
      case KEY_7:
        this.gameInstance.drawEngine.camera.pitch -= 1;
        break;
      case KEY_8:
        this.gameInstance.drawEngine.camera.pitch += 1;
        break;
      case KEY_B:
        // ucm.forwardBackward('break', state);
        break;
      case KEY_SPACE:
        this.shoot = state === 'start';
        break;
      case KEY_LEFT:
        this.left = state === 'start';
        break;
      case KEY_RIGHT:
        this.right = state === 'start';
        break;
      case KEY_UP:
      case KEY_SHIFT:
        this.forward = state === 'start';
        break;
      case KEY_DOWN:
        this.backward = state === 'start';
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
      case KEY_SHIFT:
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
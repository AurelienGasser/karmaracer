G_userCommandCounter = 0;

var UserCommand = function(gameInstance, ts) {
  this.actions = {
    forward:  gameInstance.keyboardHandler.forward,
    backward: gameInstance.keyboardHandler.backward
  };
  this.ts = ts;
  this.active = false;
  for (var action in this.actions) {
    if (this.actions[action] === true) {
      this.active = true;
      break;
    }
  }
  if (!this.active) {
    return;
  } else {
    this.seq = ++G_userCommandCounter;
  }
}

module.exports = UserCommand;
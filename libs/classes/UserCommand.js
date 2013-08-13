G_userCommandCounter = 0;

var UserCommand = function(gameInstance, ts) {
  this.actions = {
    forward:  gameInstance.keyboardHandler.forward,
    backward: gameInstance.keyboardHandler.backward,
    left:     gameInstance.keyboardHandler.left,
    right:    gameInstance.keyboardHandler.right,
    shoot:    gameInstance.keyboardHandler.shoot
  };
  this.mousePos = {
    force: gameInstance.steeringWheelController.force,
    angle: gameInstance.steeringWheelController.angle
  };
  this.ts = ts;
  this.active = true;
  // for (var action in this.actions) {
  //   if (this.actions[action] === true) {
  //     this.active = true;
  //     break;
  //   }
  // }
  if (!this.active) {
    return;
  } else {
    this.seq = ++G_userCommandCounter;
  }
}

module.exports = UserCommand;
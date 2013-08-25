G_userCommandCounter = 0;

var UserCommand = function(gameInstance, ts) {
  this.actions = {
    forward:  gameInstance.keyboardHandler.forward,
    backward: gameInstance.keyboardHandler.backward,
    left:     gameInstance.keyboardHandler.left,
    right:    gameInstance.keyboardHandler.right,
    shoot:    gameInstance.keyboardHandler.shoot
  };
  if ($('#use_mouse_for_direction').is(':checked')) {
    this.mousePos = {
      force: gameInstance.steeringWheelController.force,
      angle: gameInstance.steeringWheelController.angle
    };
  } else {
    this.mousePos = {
      force: 1,
      angle: gameInstance.myCar.r || 0
    };
  }
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
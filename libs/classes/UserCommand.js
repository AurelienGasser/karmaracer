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

UserCommand.prototype.isNotMoving = function() {
  return this.actions.forward === false && this.actions.backward === false;
}

UserCommand.prototype.isEqual = function(userCmd) {
  if (typeof userCmd === 'undefined') {
    return false;
  }
  for (var action in this.actions) {
    if (this.actions[action] !== userCmd.actions[action]) {
      return false;
    }
  }
  if (this.mousePos.force !== userCmd.mousePos.force) {
    return false;
  }
  if (this.mousePos.angle !== userCmd.mousePos.angle) {
    return false;
  }
  return true;
}

module.exports = UserCommand;
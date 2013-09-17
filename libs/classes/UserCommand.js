var UserCommand = function(gameInstance, ts, clockSyncDifference) {
  this.clockSyncDifference = gameInstance.clockSync.difference;
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
}

UserCommand.prototype.isIdle = function() {
  for (var action in this.actions) {
    if (this.actions[action] === true) {
      return false;
    }
  }
  return true;
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

UserCommand.prototype.execute = function(body, angleLeftRight, distance) {
  body.turn(this.mousePos.angle - body.r);
  if (this.actions.left === true) {
    body.turn(-angleLeftRight);
  }
  if (this.actions.right === true) {
    body.turn(angleLeftRight);
  }
  if (this.actions.forward === true) {
    body.accelerateWithForce(distance, this.mousePos.force);
  }
  if (this.actions.backward === true) {
    body.accelerateWithForce(-distance / 2, this.mousePos.force);
  }
};

module.exports = UserCommand;
var currentlyPressedKeys = {};

function handleKeyDown(event) {
  currentlyPressedKeys[event.keyCode] = true;
}

function handleKeyUp(event) {
  currentlyPressedKeys[event.keyCode] = false;
}

function handleKeys() {
  if (!($('#chat_input').is(':focus'))) {
    if (currentlyPressedKeys[37]) {
      // Left cursor key or A
      G_game.socketManager.getConnection().emit('turnCar', +6);
    }  if (currentlyPressedKeys[39]) {
      // Right cursor key or D
      G_game.socketManager.getConnection().emit('turnCar', -6);
    }
    if (currentlyPressedKeys[38]) {
      // Up cursor key or W
      G_game.socketManager.getConnection().emit('accelerate', 6.0);
    }  if (currentlyPressedKeys[40]) {
      // Down cursor key
      G_game.socketManager.getConnection().emit('accelerate', -6.0);
    }  if (currentlyPressedKeys[65]) {
      // Q
    }  if (currentlyPressedKeys[68]) {
      // D
    }  if (currentlyPressedKeys[87]) {
      // Up cursor key or W
    }  if (currentlyPressedKeys[83]) {
      // S
    }    if (currentlyPressedKeys[76]) {
      // S
      G_game.drawEngine.camera.scale *= 1.1;
    }    if (currentlyPressedKeys[80]) {
      // S
      G_game.drawEngine.camera.scale *= 0.9;
    }

  } else {
    if (currentlyPressedKeys[13]) {
      //console.log('key pressed');
      sendMsg();
    }
  }
}

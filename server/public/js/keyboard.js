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
      game.SocketManager.nodeserver.emit('turnCar', +6);
    }  if (currentlyPressedKeys[39]) {
      // Right cursor key or D
      game.SocketManager.nodeserver.emit('turnCar', -6);
    }
    if (currentlyPressedKeys[38]) {
      // Up cursor key or W
      game.SocketManager.nodeserver.emit('accelerate', 6.0);
    }  if (currentlyPressedKeys[40]) {
      // Down cursor key
      game.SocketManager.nodeserver.emit('accelerate', -6.0);
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
      cameraHeight += 0.1
      carPosY *= 1.1;
      game.drawEngine.camera.scale *= 1.1;
    }    if (currentlyPressedKeys[80]) {
      // S
      carPosY *= 0.9;
      cameraHeight -= 0.1;
      game.drawEngine.camera.scale *= 0.9;
    }

  } else {
    if (currentlyPressedKeys[13]) {
      console.log('key pressed');
      sendMsg();
    }
  }
}

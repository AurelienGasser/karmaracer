
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
      xPos -= 0.1;
    }  if (currentlyPressedKeys[39]) {
      // Right cursor key or D
      xPos += 0.1;
    }
    if (currentlyPressedKeys[38]) {
      // Up cursor key or W
      zPos -= 0.1;
    }  if (currentlyPressedKeys[40]) {
      // Down cursor key
      zPos += 0.1;
    }  if (currentlyPressedKeys[65]) {
      // Q
      nodeserver.emit('turnCar', +0.2);
    }  if (currentlyPressedKeys[68]) {
      // D
      nodeserver.emit('turnCar', -0.2);
    }  if (currentlyPressedKeys[87]) {
      // Up cursor key or W
      nodeserver.emit('accelerate', 5.0);
    }  if (currentlyPressedKeys[83]) {
     // S
      nodeserver.emit('accelerate', -5.0);
    }    if (currentlyPressedKeys[76]) {
    // S
      cameraHeight += 0.1;
    }    if (currentlyPressedKeys[80]) {
      // S
      cameraHeight -= 0.1;
    }

  } else {
    if (currentlyPressedKeys[13]) {
      console.log('key pressed');
      sendMsg();
    }
  }
}

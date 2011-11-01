var gl;
var lastTime = 0;
var worldVertexPositionBuffer = {
  road: null,
  grass: null,
  car: null
};
var worldVertexTextureCoordBuffer = {
  road: null,
  grass: null,
  car: null
};  
var tabTextures = {
  grass: null, 
  road: null, 
  car: null
}

var tabTexturesSources = {
  grass: "../sprites/grass.gif", 
  road: "../sprites/road.jpg", 
  car: "../sprites/car.png"
};
var tabItems = ['road', 'grass', 'car'];  
var pitch = -90;
var pitchRate = 0;
var yaw = 0;
var yawRate = 0;
var xPos = 0;
var yPos = 10;
var zPos = 0;
var speed = 0;  
var shaderProgram;
var grassTexture;
var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();
var currentlyPressedKeys = {};
var carPosY = 9.9;
var cameraHeight = 10;

function initGL(canvas) {
  try {
    gl = canvas.getContext("experimental-webgl", { antialias: false});
      //                                  
    canvas.width = $('#game-canvas').width() - 10;
    canvas.height = $('#game-canvas').height();
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  } catch (e) {
    alert('Unable to init WebGL Canvas');
  }
   if (!gl) {
     alert("Could not initialise WebGL, sorry :-(");
   }
}

function getShader(gl, id) {
  var shaderScript = document.getElementById(id);
  if (!shaderScript) {
    return null;
  }
  var str = "";
  var k = shaderScript.firstChild;
  while (k) {
    if (k.nodeType == 3) {
      str += k.textContent;
    }
    k = k.nextSibling;
  }
  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }
  gl.shaderSource(shader, str);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
  z
}


function initShaders() {
  var fragmentShader = getShader(gl, "shader-fs");
  var vertexShader = getShader(gl, "shader-vs");
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Could not initialise shaders");
  }
  gl.useProgram(shaderProgram);
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
  shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
  gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
}


function handleLoadedTexture(texture) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

function initTexture() {
  for (var i in tabItems) {
    var item = tabItems[i];
    tabTextures[item] = gl.createTexture();
    tabTextures[item].image = new Image();
    tabTextures[item].image.src = tabTexturesSources[item];
  }
  tabTextures.grass.image.onload = function () {
    handleLoadedTexture(tabTextures.grass)
  }
  tabTextures.road.image.onload = function () {
    handleLoadedTexture(tabTextures.road)
  }
  tabTextures.car.image.onload = function () {
    handleLoadedTexture(tabTextures.car)
  }
}


function mvPushMatrix() {
  var copy = mat4.create();
  mat4.set(mvMatrix, copy);
  mvMatrixStack.push(copy);
}


function mvPopMatrix() {
  if (mvMatrixStack.length == 0) {
    throw "Invalid popMatrix!";
  }
  mvMatrix = mvMatrixStack.pop();
}


function setMatrixUniforms() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}


function degToRad(degrees) {
  return degrees * Math.PI / 180;
}


function handleKeyDown(event) {
  currentlyPressedKeys[event.keyCode] = true;
}


function handleKeyUp(event) {
  currentlyPressedKeys[event.keyCode] = false;
}


function handleKeys() {

  if (!($('#chat_input').is(':focus')))
  {
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
      nodeserver.emit('turnCar', -0.2);
    }  if (currentlyPressedKeys[68]) {
      // D
      nodeserver.emit('turnCar', 0.2);
    }  if (currentlyPressedKeys[87]) {
      // W
      nodeserver.emit('accelerate', 10.0);
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


function handleLoadedWorld(data) {
  var vertexCount = {
    road: null,
    grass: null,
    car: null
  };
  var vertexPositions = {
    road: [],
    grass: [],
    car: [] 
  };
  var vertexTextureCoords = {
    road: [],
    grass: [],
    car: []
  };
  for (var item in data) {
    for (var i in data[item]) {
      var vals = data[item][i];
      // It is a line describing a vertex; get X, Y and Z first
      vertexPositions[item].push(parseFloat(vals[0]));
      vertexPositions[item].push(parseFloat(vals[1]));
      vertexPositions[item].push(parseFloat(vals[2]));
      // And then the texture coords
      vertexTextureCoords[item].push(parseFloat(vals[3]));
      vertexTextureCoords[item].push(parseFloat(vals[4]));
      vertexCount[item] += 1;
    }
  }

  for (var i in tabItems) {
    var item = tabItems[i];
    worldVertexPositionBuffer[item] = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexPositionBuffer[item]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions[item]), gl.STATIC_DRAW);
    worldVertexPositionBuffer[item].itemSize = 3;
    worldVertexPositionBuffer[item].numItems = vertexCount[item];
    worldVertexTextureCoordBuffer[item] = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexTextureCoordBuffer[item]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexTextureCoords[item]), gl.STATIC_DRAW);
    worldVertexTextureCoordBuffer[item].itemSize = 2;
    worldVertexTextureCoordBuffer[item].numItems = vertexCount[item];      
  }

  document.getElementById("loadingtext").textContent = "";
}


function loadWorld() {
  handleLoadedWorld({
    grass: [
    [-1.0,  0.0, -1.0, 0.0, 2.0],
    [-1.0,  0.0,  1.0, 0.0, 0.0],
    [1.0,  0.0,  1.0, 2.0, 0.0],
    [-1.0,  0.0, -1.0, 0.0, 2.0],
    [1.0,  0.0, -1.0, 2.0, 2.0],
    [1.0,  0.0,  1.0, 2.0, 0.0]
    ],

    road: [
    [1.0,  0.0, -1.0, 0.0, 2.0],
    [1.0,  0.0,  1.0, 0.0, 0.0],
    [3.0,  0.0,  1.0, 2.0, 0.0],
    [1.0,  0.0, -1.0, 0.0, 2.0],
    [3.0,  0.0, -1.0, 2.0, 2.0],
    [3.0,  0.0,  1.0, 2.0, 0.0]
    ],

    car: [
    [-0.5,  0.0, -0.5,  0.0, 1.0],
    [-0.5,  0.0,  0.5,  0.0, 0.0],
    [0.5,  0.0,  0.5, 1.0, 0.0],
    [-0.5,  0.0, -0.5,  0.0, 1.0],
    [0.5,  0.0, -0.5, 1.0, 1.0],
    [0.5,  0.0,  0.5, 1.0, 0.0]
    ]
  });
}


function drawScene() {
//  console.log(cars);
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  if (worldVertexTextureCoordBuffer.road == null || worldVertexPositionBuffer.road == null ||  worldVertexTextureCoordBuffer.grass == null || worldVertexPositionBuffer.grass == null) {
    return;
  }
  mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
  mat4.identity(mvMatrix);
  _.each(cars, function(car) {

    var item = 'car';
    mvPushMatrix();    
    mat4.rotate(mvMatrix, degToRad(-pitch), [1, 0, 0]);
    mat4.translate(mvMatrix, [0, -cameraHeight, 0]);      
    mat4.translate(mvMatrix, [-car.x - xPos, -carPosY, car.y- zPos]);  
    mat4.rotate(mvMatrix, -car.r, [0, 1, 0]);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tabTextures[item]);
    gl.uniform1i(shaderProgram.samplerUniform, 0);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.uniform1f(shaderProgram.alphaUniform, 0);      
    gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexTextureCoordBuffer[item]);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, worldVertexTextureCoordBuffer[item].itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexPositionBuffer[item]);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, worldVertexPositionBuffer[item].itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, worldVertexPositionBuffer[item].numItems);
    mvPopMatrix();    
  });
  
  for (var i in tabItems) {
    var item = tabItems[i];
    if (item == 'car') {
      continue;
    }
    mvPushMatrix();
    mat4.rotate(mvMatrix, degToRad(-pitch), [1, 0, 0]);
    mat4.translate(mvMatrix, [0, -cameraHeight, 0]);          
    mat4.rotate(mvMatrix, degToRad(-yaw), [0, 1, 0]);
    mat4.translate(mvMatrix, [-xPos, -yPos, -zPos]);      
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tabTextures[item]);
    gl.uniform1i(shaderProgram.samplerUniform, 0);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.uniform1f(shaderProgram.alphaUniform, 0);      
    gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexTextureCoordBuffer[item]);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, worldVertexTextureCoordBuffer[item].itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexPositionBuffer[item]);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, worldVertexPositionBuffer[item].itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, worldVertexPositionBuffer[item].numItems);
    mvPopMatrix();      
  }
}


function animate() {
  var timeNow = new Date().getTime();
  if (lastTime != 0) {
    var elapsed = timeNow - lastTime;
    if (speed != 0) {
      xPos -= Math.sin(degToRad(yaw)) * speed * elapsed;
      zPos -= Math.cos(degToRad(yaw)) * speed * elapsed;
      yPos = 0.4;
    }
    yaw += yawRate * elapsed;
    pitch += pitchRate * elapsed;
  }
  lastTime = timeNow;
}


function tick() {
  requestAnimFrame(tick);
  handleKeys();
  drawScene();
  animate();
}




function webGLStart(canvasID) {
  var canvas = document.getElementById(canvasID);
  initGL(canvas);
  initShaders();
  initTexture();
  loadWorld();
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  document.onkeydown = handleKeyDown;
  document.onkeyup = handleKeyUp;
  tick();
}





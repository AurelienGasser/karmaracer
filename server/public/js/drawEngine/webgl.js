function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

function EngineWebGL(game, canvas, canvasID, gl) {
  this.canvas = canvas;
  this.canvasID = canvasID;
  this.game = game;
  this.gl = gl;
  this.tabItems = ['road', 'grass', 'car'];
  this.tabTextures = {
    grass: null,
    road: null,
    car: null
  };
  this.tabTexturesSources = {
    grass: { file: "../sprites/grass.gif", size: 128 },
    road: { file: "../sprites/road.jpg", size: 128 },
    car: { file: "../sprites/car.png", size: 128 }
  };
  this.worldVertexPositionBuffer = {
    road: null,
    grass: null,
    car: null
  };
  this.worldVertexTextureCoordBuffer = {
    road: null,
    grass: null,
    car: null
  };
  this.mvMatrix = mat4.create();
  this.mvMatrixStack = [];
  this.pMatrix = mat4.create();
  this.pitch = -90;
  this.init();
  this.loaded();
  return this;
}

EngineWebGL.prototype.init = function() {
  this.initShaders();
  this.initTexture();
  this.loadWorld();
  this.loaded();
  this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
  this.gl.enable(this.gl.DEPTH_TEST);
  this.camera = new Camera(null, this.canvasID);
};

EngineWebGL.prototype.initShaders = function() {
  var fragmentShader = this.getShader("shader-fs");
  var vertexShader = this.getShader("shader-vs");
  this.shaderProgram = this.gl.createProgram();
  this.gl.attachShader(this.shaderProgram, vertexShader);
  this.gl.attachShader(this.shaderProgram, fragmentShader);
  this.gl.linkProgram(this.shaderProgram);
  if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
    alert("Could not initialise shaders");
  }
  this.gl.useProgram(this.shaderProgram);
  this.shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
  this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);
  this.shaderProgram.textureCoordAttribute = this.gl.getAttribLocation(this.shaderProgram, "aTextureCoord");
  this.gl.enableVertexAttribArray(this.shaderProgram.textureCoordAttribute);
  this.shaderProgram.pMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uPMatrix");
  this.shaderProgram.mvMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uMVMatrix");
  this.shaderProgram.samplerUniform = this.gl.getUniformLocation(this.shaderProgram, "uSampler");
}

EngineWebGL.prototype.getShader = function(id) {
  var shaderScript = document.getElementById(id);
  if (!shaderScript) {
    return null;
  }
  var str = "";
  var k = shaderScript.firstChild;
  var shader;
  while (k) {
    if (k.nodeType == 3) {
      str += k.textContent;
    }
    k = k.nextSibling;
  }
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = this.gl.createShader(this.gl.VERTEX_SHADER);
  } else {
    return null;
  }
  this.gl.shaderSource(shader, str);
  this.gl.compileShader(shader);
  if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
    alert(this.gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

EngineWebGL.prototype.initTexture = function() {
  for (var i in this.tabItems) {
    var item = this.tabItems[i];
    this.tabTextures[item] = this.gl.createTexture();
    this.tabTextures[item].image = new Image();
    this.tabTextures[item].image.src = this.tabTexturesSources[item].file;
  }
  this.tabTextures.grass.image.onload = function () {
    this.handleLoadedTexture(this.tabTextures.grass)
  }.bind(this);
  this.tabTextures.road.image.onload = function () {
    this.handleLoadedTexture(this.tabTextures.road)
  }.bind(this);
  this.tabTextures.car.image.onload = function () {
    this.handleLoadedTexture(this.tabTextures.car)
  }.bind(this);
}

EngineWebGL.prototype.handleLoadedTexture = function(texture) {
  this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
  this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
  this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, texture.image);
  this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
  this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
  this.gl.bindTexture(this.gl.TEXTURE_2D, null);
}

EngineWebGL.prototype.loadWorld = function() {
  var car_width = 16.75 * this.tabTexturesSources.car.size / 65;

  this.handleLoadedWorld({
    grass: [
    [-0.5,  0.0, -0.5,  0.0, 1.0],
    [-0.5,  0.0,  0.5,  0.0, 0.0],
    [0.5,  0.0,  0.5, 1.0, 0.0],
    [-0.5,  0.0, -0.5,  0.0, 1.0],
    [0.5,  0.0, -0.5, 1.0, 1.0],
    [0.5,  0.0,  0.5, 1.0, 0.0]
    ],

    road: [
    [-0.5,  0.0, -0.5,  0.0, 1.0],
    [-0.5,  0.0,  0.5,  0.0, 0.0],
    [0.5,  0.0,  0.5, 1.0, 0.0],
    [-0.5,  0.0, -0.5,  0.0, 1.0],
    [0.5,  0.0, -0.5, 1.0, 1.0],
    [0.5,  0.0,  0.5, 1.0, 0.0]
    ],

    car: [
    [-car_width/2,  0.0, -car_width/2,  0.0, 1.0],
    [-car_width/2,  0.0,  car_width/2,  0.0, 0.0],
    [car_width/2,  0.0,  car_width/2, 1.0, 0.0],
    [-car_width/2,  0.0, -car_width/2,  0.0, 1.0],
    [car_width/2,  0.0, -car_width/2, 1.0, 1.0],
    [car_width/2,  0.0,  car_width/2, 1.0, 0.0]
    ]
  });
}

EngineWebGL.prototype.loadWalls = function(data) {
  var vertexPositions = [];
  var vertexTextureCoords = [];
  var vertexCount = [];

  this.walls = G_gameInstance.walls;
  var walls = this.walls;

   for (var i in walls) {
     vertexPositions[i] =
     [
       -walls[i].w / 2    , 0.0       , -(-walls[i].h / 2),
       -walls[i].w / 2    , 0.0       , -(+walls[i].h / 2),
       +walls[i].w / 2    , 0.0       , -(+walls[i].h / 2),
       -walls[i].w / 2    , 0.0       , -(-walls[i].h / 2),
       +walls[i].w / 2    , 0.0       , -(-walls[i].h / 2),
       +walls[i].w / 2    , 0.0       , -(+walls[i].h / 2),
     ];

     vertexTextureCoords[i] =
     [
       0.0                , walls[i].h / 100,
       0.0                , 0.0,
       walls[i].w / 100   , 0.0,
       0.0                , walls[i].h / 100,
       walls[i].w / 100   , walls[i].h / 100,
       walls[i].w / 100   , 0.0,
     ];

     vertexCount[i] = 6;
   }

   this.wallVertexPositionBuffer = [];
   this.wallVertexTextureCoordBuffer = [];
   for (var i in walls) {
     this.wallVertexPositionBuffer[i] = this.gl.createBuffer();
     this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.wallVertexPositionBuffer[i]);
     this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertexPositions[i]), this.gl.STATIC_DRAW);
     this.wallVertexPositionBuffer[i].itemSize = 3;
     this.wallVertexPositionBuffer[i].numItems = vertexCount[i];
     this.wallVertexTextureCoordBuffer[i] = this.gl.createBuffer();
     this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.wallVertexTextureCoordBuffer[i]);
     this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertexTextureCoords[i]), this.gl.STATIC_DRAW);
     this.wallVertexTextureCoordBuffer[i].itemSize = 2;
     this.wallVertexTextureCoordBuffer[i].numItems = vertexCount[i];
   }
}

EngineWebGL.prototype.handleLoadedWorld = function(data) {
  this.loadWalls(data);
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
  for (var i in this.tabItems) {
    var item = this.tabItems[i];
    this.worldVertexPositionBuffer[item] = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.worldVertexPositionBuffer[item]);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertexPositions[item]), this.gl.STATIC_DRAW);
    this.worldVertexPositionBuffer[item].itemSize = 3;
    this.worldVertexPositionBuffer[item].numItems = vertexCount[item];
    this.worldVertexTextureCoordBuffer[item] = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.worldVertexTextureCoordBuffer[item]);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertexTextureCoords[item]), this.gl.STATIC_DRAW);
    this.worldVertexTextureCoordBuffer[item].itemSize = 2;
    this.worldVertexTextureCoordBuffer[item].numItems = vertexCount[item];
  }
}

EngineWebGL.prototype.tick = function() {
  requestAnimFrame(this.tick.bind(this));
  this.drawScene();
}

EngineWebGL.prototype.loaded = function() {
  $('#loadingtext').html('');
};

EngineWebGL.prototype.mvPushMatrix = function() {
  var copy = mat4.create();
  mat4.set(this.mvMatrix, copy);
  this.mvMatrixStack.push(copy);
}

EngineWebGL.prototype.mvPopMatrix = function() {
  if (this.mvMatrixStack.length == 0) {
    throw "Invalid popMatrix!";
  }
  this.mvMatrix = this.mvMatrixStack.pop();
}

EngineWebGL.prototype.setMatrixUniforms = function() {
  this.gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, this.pMatrix);
  this.gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix);
}

EngineWebGL.prototype.drawScene = function() {
  var cameraHeight = G_gameInstance.drawEngine.camera.scale * 600;
  if (G_gameInstance.mycar == undefined) {
    G_gameInstance.mycar = { x: 0, y: 0 };
  }
  this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
  this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  if (this.worldVertexTextureCoordBuffer.road == null || this.worldVertexPositionBuffer.road == null ||  this.worldVertexTextureCoordBuffer.grass == null || this.worldVertexPositionBuffer.grass == null) {
    return;
  }
  mat4.perspective(45, this.gl.viewportWidth / this.gl.viewportHeight, 0.1, 1000.0, this.pMatrix);
  mat4.identity(this.mvMatrix);

   this.drawCars(cameraHeight)
   this.drawMap(cameraHeight)
}

EngineWebGL.prototype.drawMap = function(cameraHeight) {
//  this.drawGround(cameraHeight)
  this.drawWalls(cameraHeight)
}

EngineWebGL.prototype.drawWalls = function(cameraHeight) {
  for (var i in this.walls) {
    this.mvPushMatrix();
    mat4.rotate(this.mvMatrix, degToRad(-this.pitch), [1, 0, 0]);
    mat4.translate(this.mvMatrix, [0, -cameraHeight, 0]);
    mat4.translate(this.mvMatrix, [-G_gameInstance.mycar.x, 0, G_gameInstance.mycar.y]);
    mat4.translate(this.mvMatrix, [this.walls[i].x, 0, -this.walls[i].y]);
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.tabTextures.road);
    this.gl.uniform1i(this.shaderProgram.samplerUniform, 0);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
    this.gl.enable(this.gl.BLEND);
    this.gl.disable(this.gl.DEPTH_TEST);
    this.gl.uniform1f(this.shaderProgram.alphaUniform, 0);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.wallVertexTextureCoordBuffer[i]);
    this.gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, this.wallVertexTextureCoordBuffer[i].itemSize, this.gl.FLOAT, false, 0, 0);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.wallVertexPositionBuffer[i]);
    this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.wallVertexPositionBuffer[i].itemSize, this.gl.FLOAT, false, 0, 0);
    this.setMatrixUniforms();
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.wallVertexPositionBuffer[i].numItems);
    this.mvPopMatrix();
  }
}

EngineWebGL.prototype.drawGround = function(cameraHeight) {
  for (var i in this.tabItems) {
    var item = this.tabItems[i];
    if (item == 'car') {
      continue;
    }
    this.mvPushMatrix();
    mat4.rotate(this.mvMatrix, degToRad(-this.pitch), [1, 0, 0]);
    mat4.translate(this.mvMatrix, [0, -cameraHeight, 0]);
    mat4.translate(this.mvMatrix, [-G_gameInstance.mycar.x, 0, G_gameInstance.mycar.y]);
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.tabTextures[item]);
    this.gl.uniform1i(this.shaderProgram.samplerUniform, 0);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
    this.gl.enable(this.gl.BLEND);
    this.gl.disable(this.gl.DEPTH_TEST);
    this.gl.uniform1f(this.shaderProgram.alphaUniform, 0);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.worldVertexTextureCoordBuffer[item]);
    this.gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, this.worldVertexTextureCoordBuffer[item].itemSize, this.gl.FLOAT, false, 0, 0);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.worldVertexPositionBuffer[item]);
    this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.worldVertexPositionBuffer[item].itemSize, this.gl.FLOAT, false, 0, 0);
    this.setMatrixUniforms();
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.worldVertexPositionBuffer[item].numItems);
    this.mvPopMatrix();
  }
}

EngineWebGL.prototype.drawCars = function(cameraHeight) {
  _.each(G_gameInstance.cars, function(car) {
    var item = 'car';
    this.mvPushMatrix();
    mat4.rotate(this.mvMatrix, degToRad(-this.pitch), [1, 0, 0]);
    mat4.translate(this.mvMatrix, [0, -cameraHeight, 0]);
    mat4.translate(this.mvMatrix, [-G_gameInstance.mycar.x    , 0  , G_gameInstance.mycar.y]);
    mat4.translate(this.mvMatrix, [+car.x, 0  , -car.y]);
    mat4.rotate(this.mvMatrix, car.r, [0, 1, 0]);
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.tabTextures[item]);
    this.gl.uniform1i(this.shaderProgram.samplerUniform, 0);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
    this.gl.enable(this.gl.BLEND);
    this.gl.disable(this.gl.DEPTH_TEST);
    this.gl.uniform1f(this.shaderProgram.alphaUniform, 0);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.worldVertexTextureCoordBuffer[item]);
    this.gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, this.worldVertexTextureCoordBuffer[item].itemSize, this.gl.FLOAT, false, 0, 0);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.worldVertexPositionBuffer[item]);
    this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.worldVertexPositionBuffer[item].itemSize, this.gl.FLOAT, false, 0, 0);
    this.setMatrixUniforms();
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.worldVertexPositionBuffer[item].numItems);
    this.mvPopMatrix();
  }.bind(this))
}


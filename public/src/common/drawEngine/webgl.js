// o--------------->
// |  map  |       x
// |_______|
// |
// |
// v y

(function() {
  "use strict";

  function EngineWebGL(gameInstance, canvas, canvasID, worldInfo) {
    this.gameInstance = gameInstance;
    this.canvas = canvas;
    this.canvasID = canvasID;
    this.worldInfo = worldInfo;
    this.interpolator = gameInstance.interpolator;
    this.gl = setupWebGL(canvas, { antialiasing: false });
    this.camera = { pitch: 83, x: 3, y: 0, z: 1 };
    
    var gl = this.gl;        

    this.initShaders();
 
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    this.pMatrix = mat4.create();
    this.mvMatrix = mat4.create();
    this.flipMatrix = mat4.create(); // invert the y axis
    this.flipMatrix[0] = -1;

    this.mvMatrixStack = [];

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);

    // this.tabItems = ['road', 'grass', 'car'];
    // this.tabTextures = {
    //   grass: null,
    //   road: null,
    //   car: null
    // };
    // this.tabTexturesSources = {
    //   grass: { file: "../sprites/grass.gif", size: 128 },
    //   road: { file: "../sprites/road.jpg", size: 128 },
    //   car: { file: "../sprites/c1.png", size: 128 }
    // };
    // this.initTexture();
    // this.worldVertexPositionBuffer = {
    //   road: null,
    //   grass: null,
    //   car: null
    // };
    // this.worldVertexTextureCoordBuffer = {
    //   road: null,
    //   grass: null,
    //   car: null
    // };
    
    // this.loadWorld();
    // this.gl.enable(this.gl.DEPTH_TEST);
    // this.pitch = -90;
    //
    return this;
  }
  
  EngineWebGL.prototype.initShaders = function() {
    var gl = this.gl;
    this.shaderProgram = createProgramFromScripts(gl, ["shader-vs", "shader-fs"]);
    gl.useProgram(this.shaderProgram);    

    this.shaderProgram.vertexPositionAttribute = gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);
    this.shaderProgram.uPMatrix = gl.getUniformLocation(this.shaderProgram, "uPMatrix");
    this.shaderProgram.uMVMatrix = gl.getUniformLocation(this.shaderProgram, "uMVMatrix");    
    this.shaderProgram.flipMatrix = gl.getUniformLocation(this.shaderProgram, "flipMatrix");    
  };
  
  EngineWebGL.prototype.tick = function() {
    requestAnimFrame(this.tick.bind(this));
    if (this.gameInstance) {
      this.gameInstance.tick();
    }
    this.drawScene();
  };

  EngineWebGL.prototype.drawScene = function() {    
    var gl = this.gl;
    
    // if (this.gameInstance.myCar === undefined) {
    //   this.gameInstance.myCar = { x: 0, y: 0 };
    // }
    // this.gl.viewport(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
    // if (this.worldVertexTextureCoordBuffer.road === null || this.worldVertexPositionBuffer.road === null ||
    //     this.worldVertexTextureCoordBuffer.grass === null || this.worldVertexPositionBuffer.grass === null) {
    //   return;
    // }
    
    // this.gl.disable(this.gl.LIGHTING);
    // this.gl.disable(this.gl.LIGHT0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    
    mat4.perspective(this.pMatrix, degToRad(45), this.canvas.clientWidth / this.canvas.clientHeight, 1, 1000);
    mat4.identity(this.mvMatrix);
    if (this.gameInstance && this.gameInstance.myCar) {
      var distFromCamera = 1.5;
      var r = this.gameInstance.myCar.r;
      this.camera.x = this.gameInstance.myCar.x - distFromCamera * Math.cos(r);
      this.camera.y = this.gameInstance.myCar.y - distFromCamera * Math.sin(r);
      this.camera.r = r;
    }
    mat4.rotate(this.mvMatrix, this.mvMatrix, -degToRad(this.camera.pitch), [1, 0, 0]);
    if (this.camera.r !== undefined) {
      mat4.rotate(this.mvMatrix, this.mvMatrix, Math.PI / 2, [0, 0, 1]);      
      mat4.rotate(this.mvMatrix, this.mvMatrix, -this.camera.r, [0, 0, 1]);      
    }
    mat4.translate(this.mvMatrix, this.mvMatrix, [-this.camera.x, -this.camera.y, -this.camera.z]);
    this.drawMap();
    this.drawMyCar();    
    this.drawCars();
  };  
  
  EngineWebGL.prototype.init = function(callback) {
    callback();
  };
  
  EngineWebGL.prototype.drawBox = function(pos, size, color) {
    var gl = this.gl;    
    this.mvPushMatrix();

    mat4.translate(this.mvMatrix, this.mvMatrix, [pos[0], pos[1], pos[2]]);
    mat4.rotate(this.mvMatrix, this.mvMatrix, pos[3] || 0, [0, 0, 1]);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array([
            // top
            -size[0]/2, -size[1]/2, size[2]/2,
             size[0]/2,  size[1]/2, size[2]/2,
            -size[0]/2,  size[1]/2, size[2]/2,
            -size[0]/2, -size[1]/2, size[2]/2,
             size[0]/2,  size[1]/2, size[2]/2,
             size[0]/2, -size[1]/2, size[2]/2,
            // side 1
            -size[0]/2, -size[1]/2, -size[2]/2,
            -size[0]/2,  size[1]/2,  size[2]/2,
            -size[0]/2,  size[1]/2, -size[2]/2,
            -size[0]/2, -size[1]/2, -size[2]/2,
            -size[0]/2,  size[1]/2,  size[2]/2,
            -size[0]/2, -size[1]/2,  size[2]/2,
            // side 2
             size[0]/2, -size[1]/2, -size[2]/2,
             size[0]/2,  size[1]/2,  size[2]/2,
             size[0]/2,  size[1]/2, -size[2]/2,
             size[0]/2, -size[1]/2, -size[2]/2,
             size[0]/2,  size[1]/2,  size[2]/2,
             size[0]/2, -size[1]/2,  size[2]/2,
            // side 3
            -size[0]/2,  size[1]/2, -size[2]/2,
             size[0]/2,  size[1]/2,  size[2]/2,
             size[0]/2,  size[1]/2, -size[2]/2,
            -size[0]/2,  size[1]/2, -size[2]/2,
             size[0]/2,  size[1]/2,  size[2]/2,
            -size[0]/2,  size[1]/2,  size[2]/2,
            // side 4
            -size[0]/2, -size[1]/2, -size[2]/2,
             size[0]/2, -size[1]/2,  size[2]/2,
             size[0]/2, -size[1]/2, -size[2]/2,
            -size[0]/2, -size[1]/2, -size[2]/2,
             size[0]/2, -size[1]/2,  size[2]/2,
            -size[0]/2, -size[1]/2,  size[2]/2,
            // bottom
            -size[0]/2, -size[1]/2, -size[2]/2,
             size[0]/2,  size[1]/2, -size[2]/2,
            -size[0]/2,  size[1]/2, -size[2]/2,
            -size[0]/2, -size[1]/2, -size[2]/2,
             size[0]/2,  size[1]/2, -size[2]/2,
             size[0]/2, -size[1]/2, -size[2]/2
        
        
        ]),
        this.gl.STATIC_DRAW);
        
    this.drewRectangles(6, color);      
    this.mvPopMatrix();
  };
  
  EngineWebGL.prototype.drewRectangles = function(num, color) {
    var gl = this.gl;
    var colorLocation = gl.getUniformLocation(this.shaderProgram, "u_color");    
    gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);
    gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    this.setMatrixUniforms();
    gl.uniform4f(colorLocation, color[0], color[1], color[2], 0); 
    gl.drawArrays(gl.TRIANGLES, 0, num * 6, gl.UNSIGNED_SHORT, 0);
  };  

  EngineWebGL.prototype.mvPushMatrix = function() {
    var copy = mat4.clone(this.mvMatrix);
    this.mvMatrixStack.push(copy);
  };

  EngineWebGL.prototype.mvPopMatrix = function() {
    if (this.mvMatrixStack.length === 0) {
      throw "Invalid popMatrix!";
    }
    this.mvMatrix = this.mvMatrixStack.pop();
  };

  EngineWebGL.prototype.setMatrixUniforms = function() {
    this.gl.uniformMatrix4fv(this.shaderProgram.uPMatrix, false, this.pMatrix);
    this.gl.uniformMatrix4fv(this.shaderProgram.uMVMatrix, false, this.mvMatrix);
    this.gl.uniformMatrix4fv(this.shaderProgram.flipMatrix, false, this.flipMatrix);
  };
 
 
 // UNUSED
  
  
  EngineWebGL.prototype.initTexture = function() {
    console.log('init texture');
    for (var i in this.tabItems) {
      var item = this.tabItems[i];
      this.tabTextures[item] = this.gl.createTexture();
      this.tabTextures[item].image = new Image();
      this.tabTextures[item].image.src = this.tabTexturesSources[item].file;
    }
    this.tabTextures.grass.image.onload = function () {
      this.handleLoadedTexture(this.tabTextures.grass);
    }.bind(this);
    this.tabTextures.road.image.onload = function () {
      this.handleLoadedTexture(this.tabTextures.road);
    }.bind(this);
    this.tabTextures.car.image.onload = function () {
      this.handleLoadedTexture(this.tabTextures.car);
    }.bind(this);
  };

  EngineWebGL.prototype.handleLoadedTexture = function(texture) {
    console.log('handle loaded texture');
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, texture.image);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
  };

  EngineWebGL.prototype.loadWorld = function() {
    console.log('loadWorld');
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
  };

  EngineWebGL.prototype.loadWalls = function(data) {
    console.log('load walls');
    var vertexPositions = [];
    var vertexTextureCoords = [];
    var vertexCount = [];

    this.walls = this.gameInstance.walls;
    var walls = this.walls;
    var i;
    
    for (i in walls) {
       vertexPositions[i] =
       [
         -walls[i].w / 2    , 0.0       , -(-walls[i].h / 2),
         -walls[i].w / 2    , 0.0       , -(+walls[i].h / 2),
         +walls[i].w / 2    , 0.0       , -(+walls[i].h / 2),
         -walls[i].w / 2    , 0.0       , -(-walls[i].h / 2),
         +walls[i].w / 2    , 0.0       , -(-walls[i].h / 2),
         +walls[i].w / 2    , 0.0       , -(+walls[i].h / 2)
       ];

       vertexTextureCoords[i] =
       [
         0.0                , walls[i].h / 100,
         0.0                , 0.0,
         walls[i].w / 100   , 0.0,
         0.0                , walls[i].h / 100,
         walls[i].w / 100   , walls[i].h / 100,
         walls[i].w / 100   , 0.0
       ];

       vertexCount[i] = 6;
     }

     this.wallVertexPositionBuffer = [];
     this.wallVertexTextureCoordBuffer = [];
     for (i in walls) {
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
  };

  EngineWebGL.prototype.handleLoadedWorld = function(data) {
    console.log('handle loaded world');
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
    for (var itemm in data) {
      for (var j in data[itemm]) {
        var vals = data[itemm][j];
        // It is a line describing a vertex; get X, Y and Z first
        vertexPositions[itemm].push(parseFloat(vals[0]));
        vertexPositions[itemm].push(parseFloat(vals[1]));
        vertexPositions[itemm].push(parseFloat(vals[2]));
        // And then the texture coords
        vertexTextureCoords[itemm].push(parseFloat(vals[3]));
        vertexTextureCoords[itemm].push(parseFloat(vals[4]));
        vertexCount[itemm] += 1;
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
    this.cars = this.gameInstance.cars;
  };

  EngineWebGL.prototype.addExplosion = function(explosion) {
    // console.log('add explosion');
  };

  Karma.EngineWebGL = EngineWebGL;

}());

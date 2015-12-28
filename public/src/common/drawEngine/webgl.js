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
    this.explosions = [];

    // fix canvas dimensions to avoid scaling
    canvas.width  = $(canvas).css('width').replace('px', '');
    canvas.height  = $(canvas).css('height').replace('px', '');
    
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

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // gl.enable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
  

    return this;
  }
  
  EngineWebGL.prototype.tick = function() {
    requestAnimFrame(this.tick.bind(this));
    if (this.gameInstance) {
      this.gameInstance.tick();
    }
    this.drawScene();
  };

  EngineWebGL.prototype.drawScene = function() {    
    var gl = this.gl;
    
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    
    mat4.perspective(this.pMatrix, degToRad(70), this.canvas.clientWidth / this.canvas.clientHeight, 1, 70);
    mat4.identity(this.mvMatrix);
    
    this.applyCamera();
    this.drawMap();
    this.drawMyCar();
    this.drawCars();
    this.drawExplosions();
  };  
  
  EngineWebGL.prototype.init = function(callback) {
    this.loadGroundBuffers();
    this.loadTextures(callback);
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
    gl.uniform4f(this.shaderProgram.uColor, color[0], color[1], color[2], 1.0); 
    gl.vertexAttribPointer(this.shaderProgram.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.uniform1i(this.shaderProgram.bUseTextures, 0);
    this.setMatrixUniforms();
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

  EngineWebGL.prototype.addExplosion = function(explosion) {
    // TODO
    this.explosionDuration = 1000;
    explosion.expiresOn = Date.now() + this.explosionDuration;
    this.explosions.push(explosion);
  };

  EngineWebGL.prototype.drawExplosions = function(explosion) {
    var now = Date.now();
    var toDelete = [];
    var i = this.explosions.length;1
    while (i--) {
      var e = this.explosions[i];
      if (e.expiresOn < now) {
        this.explosions.splice(i, 1);
      } else {
        this.gl.enableVertexAttribArray(this.shaderProgram.aTextureCoord);   
        this.drawExplosion(e, e.expiresOn - now);
        this.gl.disableVertexAttribArray(this.shaderProgram.aTextureCoord);        
      }
    }
  };
  
  EngineWebGL.prototype.drawExplosion = function(e, ttl) {
    var gl = this.gl;    
    this.mvPushMatrix();
    var pos = [e.x, e.y, 0.5];
    var size = [1, 1];

    mat4.translate(this.mvMatrix, this.mvMatrix, pos);
    var cos = this.camera.x - e.x;
    var sin = this.camera.y - e.y;
    var angle = Math.atan2(sin, cos) - Math.PI / 2;
    mat4.rotate(this.mvMatrix, this.mvMatrix, angle, [0, 0, 1]);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array([
            -size[0]/2, 0, -size[1]/2,
             size[0]/2, 0,  size[1]/2,
            -size[0]/2, 0,  size[1]/2,
            -size[0]/2, 0, -size[1]/2,
             size[0]/2, 0,  size[1]/2,
             size[0]/2, 0, -size[1]/2
        ]),
        this.gl.STATIC_DRAW);
    gl.vertexAttribPointer(this.shaderProgram.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.uniform1i(this.shaderProgram.bUseTextures, 1);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());    
    var texSize = 0.25;
    this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array([
          0, 0,
          texSize, texSize,
          0, texSize,
          0, 0,
          texSize, texSize,
          texSize, 0]),
        this.gl.STATIC_DRAW);
    gl.vertexAttribPointer(this.shaderProgram.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(this.gl.TEXTURE0);
    gl.bindTexture(this.gl.TEXTURE_2D, this.tabTextures.explosion);
    gl.uniform1i(this.shaderProgram.uSampler, 0);
    gl.uniform1f(this.shaderProgram.uAlpha, ttl / this.explosionDuration);
    this.setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, 6, gl.UNSIGNED_SHORT, 0);
    gl.uniform1f(this.shaderProgram.uAlpha, 1);    
    this.mvPopMatrix();
  };


  Karma.EngineWebGL = EngineWebGL;

}());

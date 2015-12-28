(function(EngineWebGL) {
  "use strict";
  
  EngineWebGL.prototype.initShaders = function() {
    var gl = this.gl;
    var program = createProgramFromScripts(gl, ["shader-vs", "shader-fs"]);
    this.shaderProgram = program;
    gl.useProgram(this.shaderProgram);    

    program.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
    gl.enableVertexAttribArray(program.aVertexPosition);
    program.aTextureCoord = gl.getAttribLocation(program, "aTextureCoord");
    gl.enableVertexAttribArray(program.aTextureCoord);
    program.uPMatrix = gl.getUniformLocation(program, "uPMatrix");
    program.uMVMatrix = gl.getUniformLocation(program, "uMVMatrix");    
    program.flipMatrix = gl.getUniformLocation(program, "flipMatrix");    
    program.uSampler = gl.getUniformLocation(program, "uSampler");
    program.uColor = gl.getUniformLocation(program, "uColor");
    program.bUseTextures = gl.getUniformLocation(program, "bUseTextures");
  };  

}(Karma.EngineWebGL));
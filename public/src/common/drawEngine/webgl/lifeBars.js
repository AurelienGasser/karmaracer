(function(EngineWebGL) {
  "use strict";
  
  EngineWebGL.prototype.drawLifeBar = function(life, maxLife, carPos) {
    var gl = this.gl;
    var pos = [carPos.x, carPos.y, 0.7];
    var size = [1, 1];
    var cos = this.camera.x - carPos.x;
    var sin = this.camera.y - carPos.y;
    var angle = Math.atan2(sin, cos) - Math.PI / 2;
    var lifeToWidthRatio = 1.0/200;
    var maxWidth = maxLife * lifeToWidthRatio;
    var fullWidth = life * lifeToWidthRatio;
    var emptyWidth = (maxLife - life) * lifeToWidthRatio;
    var height = 0.08;

    gl.uniform1i(this.shaderProgram.bUseTextures, 0);
    gl.uniform1i(this.shaderProgram.uSampler, 0);
    gl.uniform1f(this.shaderProgram.uAlpha, 0.7);    

    this.mvPushMatrix();
    mat4.translate(this.mvMatrix, this.mvMatrix, pos);
    mat4.rotate(this.mvMatrix, this.mvMatrix, angle, [0, 0, 1]);
    mat4.translate(this.mvMatrix, this.mvMatrix, [-maxWidth / 2, 0, 0]);
    mat4.translate(this.mvMatrix, this.mvMatrix, [fullWidth / 2, 0, 0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array([
            -fullWidth/2, 0, -height/2,
             fullWidth/2, 0,  height/2,
            -fullWidth/2, 0,  height/2,
            -fullWidth/2, 0, -height/2,
             fullWidth/2, 0,  height/2,
             fullWidth/2, 0, -height/2
        ]),
        this.gl.STATIC_DRAW);
    gl.vertexAttribPointer(this.shaderProgram.aVertexPosition, 3, gl.FLOAT, false, 0, 0);    
    gl.uniform4f(this.shaderProgram.uColor, 0, 1, 0, 1.0); 
    this.setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, 6, gl.UNSIGNED_SHORT, 0);
    
    mat4.translate(this.mvMatrix, this.mvMatrix, [maxWidth / 2, 0, 0]);    
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array([
            -emptyWidth/2, 0, -height/2,
             emptyWidth/2, 0,  height/2,
            -emptyWidth/2, 0,  height/2,
            -emptyWidth/2, 0, -height/2,
             emptyWidth/2, 0,  height/2,
             emptyWidth/2, 0, -height/2
        ]),
        this.gl.STATIC_DRAW);
    gl.vertexAttribPointer(this.shaderProgram.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.uniform4f(this.shaderProgram.uColor, 1, 0, 0, 1.0); 
    this.setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, 6, gl.UNSIGNED_SHORT, 0);
    
    this.mvPopMatrix();
    gl.uniform1f(this.shaderProgram.uAlpha, 1);        
  };  

}(Karma.EngineWebGL));
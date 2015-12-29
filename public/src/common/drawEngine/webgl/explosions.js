(function(EngineWebGL) {
  "use strict";
  
  EngineWebGL.prototype.addExplosion = function(explosion) {
    // TODO
    this.explosionDuration = 150;
    explosion.expiresOn = Date.now() + this.explosionDuration;
    this.explosions.push(explosion);
  };

  EngineWebGL.prototype.drawExplosions = function(explosion) {
    var now = Date.now();
    var toDelete = [];
    var i = this.explosions.length;
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
    var texCoord = this.getExplosionTextureCoord(ttl);
    this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array(texCoord),
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
  
  EngineWebGL.prototype.getExplosionTextureCoord = function(ttl) {
    var numImg = 16;
    var numCol = 4;
    var numLines = 4;
    var percent = (this.explosionDuration - ttl) / this.explosionDuration;
    var imgIndex = Math.floor(percent * numImg);
    var col = 3 - (imgIndex % numCol); // col 0 is on the left
    var line = Math.floor(imgIndex / numLines); // line 0 is at the bottom
    var texSize = 0.25; 
    var minX = col * 1.0 / numCol;
    var maxX = minX + texSize;
    var minY = line * 1.0 / numLines;
    var maxY = minY + texSize;
    return [
      minX, minY,
      maxX, maxY,
      minX, maxY,
      minX, minY,
      maxX, maxY,
      maxX, minY];
  };

}(Karma.EngineWebGL));
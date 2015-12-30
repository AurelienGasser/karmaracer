(function(EngineWebGL) {
  "use strict";  

  EngineWebGL.prototype.drawGunFlame = function(pos, weapon) {
    var w = Karma.Engine.Car.prototype.w;
    var h = Karma.Engine.Car.prototype.h;
    weapon = 'SuperMachineGun';
    switch (weapon) {
      case '90AngleMachineGun':
        this.drawSingleGunFlame(pos, 0, w / 2 + 0.85);
        this.drawSingleGunFlame(pos, Math.PI / 2, h / 2 + 0.5);
        this.drawSingleGunFlame(pos, -Math.PI / 2, h / 2 + 0.5);
        break;
      case 'SuperMachineGun':
        this.drawSingleGunFlame(pos, 0, w / 2 + 0.85);
        this.drawSingleGunFlame(pos, Math.PI / 4, (w + h) / 2 + 0.12);
        this.drawSingleGunFlame(pos, -Math.PI / 4, (w + h) / 2 + 0.12);
        break;
      case 'MachineGun':
        this.drawSingleGunFlame(pos, 0, w / 2 + 0.85);
        break;
      default:
        this.drawSingleGunFlame(pos, 0, w / 2 + 0.85);
        break;
    }
  };
  
  EngineWebGL.prototype.drawSingleGunFlame = function(car, angle, dist) {
    var gl = this.gl; 
    var pos = [
      car.x + dist * Math.cos(car.r + angle), 
      car.y + dist * Math.sin(car.r + angle), 
      this.gunFlameZCoord, 
      0.5
    ];
    this.mvPushMatrix();
    var size = [1, 0.5];

    mat4.translate(this.mvMatrix, this.mvMatrix, pos);
    mat4.rotate(this.mvMatrix, this.mvMatrix, car.r + angle, [0, 0, 1]);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array([
            -size[0]/2, -size[1]/2, 0, 
             size[0]/2,  size[1]/2, 0, 
            -size[0]/2,  size[1]/2, 0, 
            -size[0]/2, -size[1]/2, 0, 
             size[0]/2,  size[1]/2, 0, 
             size[0]/2, -size[1]/2, 0
        ]),
        this.gl.STATIC_DRAW);
    gl.vertexAttribPointer(this.shaderProgram.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.uniform1i(this.shaderProgram.bUseTextures, 1);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array([
             0, 0,
             1, 1,
             0, 1,
             0, 0,
             1, 1,
             1, 0
        ]),
        this.gl.STATIC_DRAW);
    gl.enableVertexAttribArray(this.shaderProgram.aTextureCoord);
    gl.vertexAttribPointer(this.shaderProgram.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(this.gl.TEXTURE0);
    gl.bindTexture(this.gl.TEXTURE_2D, this.tabTextures.flame);
    gl.uniform1i(this.shaderProgram.uSampler, 0);
    gl.uniform1f(this.shaderProgram.uAlpha, 1.0);
    this.setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, 6, gl.UNSIGNED_SHORT, 0);
    gl.uniform1f(this.shaderProgram.uAlpha, 1);
    this.mvPopMatrix();    
    gl.disableVertexAttribArray(this.shaderProgram.aTextureCoord);
  };
  
}(Karma.EngineWebGL));
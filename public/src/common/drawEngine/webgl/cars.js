/*global mat3 */
(function(EngineWebGL) {
  "use strict";

  EngineWebGL.prototype.loadCarBuffers = function() {
    /*jslint laxcomma: true */    
    var gl = this.gl;
    var babylon = this.getCarModel();
    
    var indices = babylon.meshes[0].indices;
    var positions = babylon.meshes[0].positions;
    var uvs = babylon.meshes[0].uvs;

    this.myCarVertexIndexBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.myCarVertexIndexBuf);
    this.gl.bufferData(
        this.gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        this.gl.STATIC_DRAW);
    this.myCarVertexIndexBuf.numItems = indices.length;        

    this.myCarVertexCoordBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.myCarVertexCoordBuf);
    this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array(positions),
        this.gl.STATIC_DRAW);
    this.myCarVertexCoordBuf.numItems = positions.length / 3;

    this.myCarTexCoordBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.myCarTexCoordBuf);
    this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array(uvs),
        this.gl.STATIC_DRAW);
  };
  
  EngineWebGL.prototype.drawMyCar = function() {
    var myCar = this.gameInstance.myCar;
    
    if (!myCar) {
      return;
    }
    this._drawCar(myCar, myCar, [0,0,1]);
  };

  EngineWebGL.prototype.drawCars = function() {
    var interpData = this.interpolator.interpData;
    if (!interpData.ready) {
      return;
    }
    var cars = interpData.snapAfter.cars;
    if (!cars) {
      return;
    }
    for (var j in cars) {
      var car = cars[j];
      var carPos = this.interpPosOfCar(j);
      var player = this.gameInstance.gameInfo[car.id];
      if (player) {
        carPos.id = car.id;
        this.gameInstance.engine.replaceCarBody(carPos);
        if (!car.dead) {
          this._drawCar(car, carPos, [1, 0, 1]);
          var maxLife = this.gameInstance.gameInfo[car.id].maxLife;
          this.drawLifeBar(car.life, maxLife, carPos);
        }
      }
    }
  };

  EngineWebGL.prototype.interpPosOfCar = function(carIndex) {
    var interpData = this.interpolator.interpData;
    var carBefore = interpData.snapBefore.cars[carIndex];
    var carAfter = interpData.snapAfter.cars[carIndex];
    return this.interpolator.interpPos(carBefore, carAfter, interpData.interpPercent);
  };

  EngineWebGL.prototype._drawCar = function(c, pos, color) {
    var gl = this.gl;
    
    var scale = 0.25;    
    var scaleMatrix = [
      scale, 0, 0,
      0, scale, 0,
      0, 0, scale
    ];

    this.mvPushMatrix();
    mat4.translate(this.mvMatrix, this.mvMatrix, [pos.x, pos.y, -0.005]);
    mat4.rotate(this.mvMatrix, this.mvMatrix, pos.r, [0, 0, 1]);
    mat4.rotate(this.mvMatrix, this.mvMatrix, Math.PI / 2, [1, 0, 0]);
    mat4.rotate(this.mvMatrix, this.mvMatrix, -Math.PI / 2, [0, 1, 0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.myCarVertexCoordBuf);
    gl.vertexAttribPointer(this.shaderProgram.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.myCarVertexIndexBuf);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.myCarTexCoordBuf);
    gl.vertexAttribPointer(this.shaderProgram.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(this.gl.TEXTURE0);
    gl.bindTexture(this.gl.TEXTURE_2D, this.tabTextures.car);
    gl.uniform1i(this.shaderProgram.bUseTextures, 1);
    gl.uniform1i(this.shaderProgram.uSampler, 0);
    gl.uniform1f(this.shaderProgram.uAlpha, 1.0);
    this.scaleMatrix = scaleMatrix;
    this.setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, this.myCarVertexIndexBuf.numItems, gl.UNSIGNED_SHORT, 0);

    this.mvPopMatrix();    
    this.scaleMatrix = mat3.create();

    if (c.shootingWithWeapon) {
      this.drawGunFlame(pos, c.shootingWithWeapon);
    }

    // //name
    // var textSize = ctx.measureText(c.playerName);
    // var textPad = 25;
    // ctx.save();
    // ctx.translate(pos.x, pos.y);
    // ctx.fillStyle = 'white';
    // ctx.fillText(c.playerName, -textSize.width / 2, -textPad);
    // this.drawLifeBar(ctx, c, player, size.w);
    // ctx.restore();
    //
    // // bullet
    // this.drawBullet(c, ctx, pos);
  };

}(Karma.EngineWebGL));
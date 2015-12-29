(function(EngineWebGL) {
  "use strict";
  
  EngineWebGL.prototype.drawMyCar = function() {
    var carHeight = 0.6;
    var myCar = this.gameInstance.myCar;
    
    if (!myCar) {
      return;
    }

    this.drawBox([myCar.x, myCar.y, carHeight / 2, myCar.r], [1, 1, carHeight], [0, 0, 1]);
    if (myCar.shootingWithWeapon) {
      this.drawGunFlame(myCar);
    }    
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
      var carPos = this.interpPosOfCar(j);
      var carId = cars[j].id;
      var player = this.gameInstance.gameInfo[carId];
      if (player) {
        var carImage = this.gameInstance.cars[player.carImageName];
        carPos.id = carId;        
        carPos.w = carImage.w;
        carPos.h = carImage.h;
        this.gameInstance.engine.replaceCarBody(carPos);
        if (!cars[j].dead) {
          this._drawCar(cars[j], carPos, carImage);          
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

  EngineWebGL.prototype._drawCar = function(c, pos, car) {
    var carHeight = 0.6;
    
    this.drawBox([pos.x, pos.y, carHeight / 2, pos.r], [car.w, car.h, carHeight], [1, 0, 1]);
    if (c.shootingWithWeapon) {
      this.drawGunFlame(c);
    }

    // // gun flammes
    // if (c.shootingWithWeapon !== null) {
    //   this.drawGunFlame(ctx, c, size);
    // }
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

  EngineWebGL.prototype.drawLifeBar = function(ctx, c, player, w) {
    // ctx.save();
    // ctx.translate(-w / 2, -40);
    // var maxLifeSize = w;
    // ctx.fillStyle = '#0F0';
    // ctx.fillRect(0, 0, maxLifeSize, 5);
    // ctx.fillStyle = '#F00';
    // var ratioSize = maxLifeSize * (c.life / player.maxLife);
    // ctx.fillRect(ratioSize, 0, maxLifeSize - ratioSize, 5);
    // ctx.restore();
  };


  EngineWebGL.prototype.drawGunFlame = function(car) {
    var w = 2 * car.w;
    car.shootingWithWeapon = 'SuperMachineGun';
    switch (car.shootingWithWeapon) {
      case '90AngleMachineGun':
        this.drawSingleGunFlame(car, 0, w / 2);
        this.drawSingleGunFlame(car, Math.PI / 2, w / 4);
        this.drawSingleGunFlame(car, -Math.PI / 2, w / 4);
        break;
      case 'SuperMachineGun':
        this.drawSingleGunFlame(car, 0, w / 2);
        this.drawSingleGunFlame(car, Math.PI / 4, w / 2);
        this.drawSingleGunFlame(car, -Math.PI / 4, w / 2);
        break;
      case 'MachineGun':
        this.drawSingleGunFlame(car, 0, w / 2);
        break;
      default:
        this.drawSingleGunFlame(car, 0, w / 2);
        break;
    }
  };
  
  EngineWebGL.prototype.drawSingleGunFlame = function(car, angle, dist) {
    var gl = this.gl; 
    var pos = [car.x + dist * Math.cos(car.r + angle), car.y + dist * Math.sin(car.r + angle), 0.1, 0.5];
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
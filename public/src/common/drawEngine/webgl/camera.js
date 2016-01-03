(function(EngineWebGL) {
  "use strict";
  
  EngineWebGL.prototype.applyCamera = function() {
    var debugLookFromAbove = false;
    
    if (!this.gameInstance || !this.gameInstance.myCar) {
      return;
    }
    
    if (debugLookFromAbove) {
      mat4.rotate(this.mvMatrix, this.mvMatrix, Math.PI / 2, [0, 0, 1]);
      mat4.rotate(this.mvMatrix, this.mvMatrix, -degToRad(180), [1, 0, 0]);
      mat4.translate(this.mvMatrix, this.mvMatrix, [-35, 5, 100]);
      return;
    } 
    
    this.updateCameraPosition();
    
    mat4.rotate(this.mvMatrix, this.mvMatrix, -degToRad(this.camera.pitch), [1, 0, 0]);    
    mat4.rotate(this.mvMatrix, this.mvMatrix, Math.PI / 2, [0, 0, 1]);      
    mat4.rotate(this.mvMatrix, this.mvMatrix, -this.camera.r, [0, 0, 1]);      
    mat4.translate(this.mvMatrix, this.mvMatrix, [-this.camera.x, -this.camera.y, -this.camera.z]);        
  };
  
  EngineWebGL.prototype.updateCameraPosition = function() {
    var interpData = this.interpolator.interpData;
    if (!interpData.ready) {
      return;
    }
    var cars = interpData.snapAfter.cars;
    if (!cars) {
      return;
    }
    for (var j in cars) {
      if (j != this.gameInstance.myCar.id) {
        continue;
      }
      var car = cars[j];
      var carPos = this.interpPosOfCar(j);
      var player = this.gameInstance.gameInfo[car.id];
      if (player) {
        carPos.id = car.id;
        this.gameInstance.engine.replaceCarBody(carPos);
        if (!car.dead) {
          var distFromCamera = 2;
          this.camera.x = carPos.x - distFromCamera * Math.cos(carPos.r);
          this.camera.y = carPos.y - distFromCamera * Math.sin(carPos.r);
          this.camera.r = carPos.r;    
        }
      }
    }    
  };

}(Karma.EngineWebGL));
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
    
    var distFromCamera = 1.5;
    var r = this.gameInstance.myCar.r;
    this.camera.x = this.gameInstance.myCar.x - distFromCamera * Math.cos(r);
    this.camera.y = this.gameInstance.myCar.y - distFromCamera * Math.sin(r);
    this.camera.r = r;
    
    mat4.rotate(this.mvMatrix, this.mvMatrix, -degToRad(this.camera.pitch), [1, 0, 0]);    
    mat4.rotate(this.mvMatrix, this.mvMatrix, Math.PI / 2, [0, 0, 1]);      
    mat4.rotate(this.mvMatrix, this.mvMatrix, -this.camera.r, [0, 0, 1]);      

    mat4.translate(this.mvMatrix, this.mvMatrix, [-this.camera.x, -this.camera.y, -this.camera.z]);    
  };

}(Karma.EngineWebGL));
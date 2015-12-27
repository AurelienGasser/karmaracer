(function(EngineWebGL) {
  "use strict";
  
    EngineWebGL.prototype.drawMap = function() {
    // this.drawGround(cameraHeight);
    // this.drawWalls(cameraHeight);
    this.drawOutsideWalls();
    this.drawGround();
    this.drawStaticItems();
  };

  EngineWebGL.prototype.drawGround = function() {
    var s = this.worldInfo.size;
    var worldWidth = s.w;
    var worldHeight = s.h;
    var gl = this.gl;
  
    this.mvPushMatrix();
    mat4.translate(this.mvMatrix, this.mvMatrix, [worldWidth / 2, worldHeight / 2, 0]);
    this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array([
            -worldWidth/2, -worldHeight/2, 0,
             worldWidth/2,  worldHeight/2, 0,
            -worldWidth/2,  worldHeight/2, 0,
            -worldWidth/2, -worldHeight/2, 0,
             worldWidth/2,  worldHeight/2, 0,
             worldWidth/2, -worldHeight/2, 0]),
        this.gl.STATIC_DRAW);
              
    this.drewRectangles(1, [0, 1, 0]);      
    this.mvPopMatrix();    
  };

  EngineWebGL.prototype.drawOutsideWalls = function() {
    var s = this.worldInfo.size;
    var worldWidth = s.w;
    var worldHeight = s.h;
    var wh = 2; // wall height    
    var gl = this.gl;
  
    // mat4.translate(this.mvMatrix, this.mvMatrix, [0, 0, +1.000]);
    // mat4.rotate(this.mvMatrix, this.mvMatrix, degToRad(90), [1, 0, 0]);

    this.drawOutsideWall({ x: worldWidth / 2, y: 0, z: wh / 2 }, { x: worldWidth, y: 0, z: wh });
    this.drawOutsideWall({ x: worldWidth / 2, y: worldHeight, z: wh / 2 }, { x: worldWidth, y: 0, z: wh });
    this.drawOutsideWall({ x: 0, y: worldHeight / 2, z: wh / 2 }, { x: 0, y: worldHeight, z: wh });
    this.drawOutsideWall({ x: worldWidth, y: worldHeight / 2, z: wh / 2 }, { x: 0, y: worldHeight, z: wh });
  };

  EngineWebGL.prototype.drawOutsideWall = function(pos, size) {
    var gl = this.gl;    
    this.mvPushMatrix();
    mat4.translate(this.mvMatrix, this.mvMatrix, [pos.x, pos.y, pos.z]);
    this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array([
            -size.x/2, -size.y/2,  size.z/2,
             size.x/2,  size.y/2,  size.z/2,
            -size.x/2, -size.y/2, -size.z/2,
            -size.x/2, -size.y/2, -size.z/2,
             size.x/2,  size.y/2,  size.z/2,
             size.x/2,  size.y/2, -size.z/2]),
        this.gl.STATIC_DRAW);
      
    this.drewRectangles(1, [1, 0, 0]);      
    this.mvPopMatrix();
  };
  
  EngineWebGL.prototype.drawStaticItems = function() {
    if (!this.worldInfo.staticItems) {
      return;
    }
    var height = 1;
    for (var i in this.worldInfo.staticItems) {
      var c = this.worldInfo.staticItems[i];

      if (c) {
        this.drawBox([c.x, c.y, height / 2, c.r], [c.w, c.h, height], [1, 0, 0]);
      }
    }
  };

}(Karma.EngineWebGL));
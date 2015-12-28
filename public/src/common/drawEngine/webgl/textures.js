(function(EngineWebGL) {
  "use strict";
  
  EngineWebGL.prototype.initTextures = function() {
    var gl = this.gl;
    var tabTextures = {};
    
    this.tabTexturesSources = {
      grass: { file: "../sprites/3d/grass-128.png", size: 128 },
      wall: { file: "../sprites/wall.png", size: 128 }
    };
        
    for (var texName in this.tabTexturesSources) {
      var texture;
      tabTextures[texName] = texture = this.gl.createTexture();
      texture.image = new Image();
      texture.image.src = this.tabTexturesSources[texName].file;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      // Fill the texture with a 1x1 white pixel.
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255])); 
      tabTextures[texName].image.onload = this.handleLoadedTexture(tabTextures[texName]).bind(this);
    }
    
    this.tabTextures = tabTextures;
  };
  
  EngineWebGL.prototype.handleLoadedTexture = function(texture) {
    return function() {
      var gl = this.gl;
      this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      // NEAREST, LINEAR
      // NEAREST_MIPMAP_NEAREST, LINEAR_MIPMAP_NEAREST
      // NEAREST_MIPMAP_LINEAR, LINEAR_MIPMAP_LINEAR
        
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.bindTexture(gl.TEXTURE_2D, null);
    };
  };

}(Karma.EngineWebGL));
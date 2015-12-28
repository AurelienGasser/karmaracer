(function(EngineWebGL) {
  "use strict";
  
  EngineWebGL.prototype.loadTextures = function(callback) {
    var tabTexturesSources = {
      grass: { file: "../sprites/3d/grass-128.png", size: 128 },
      wall: { file: "../sprites/wall.png", size: 128 }
    };
    var tabTextures = {};
    var promises = [];
    var gl = this.gl;
    
    for (var texName in tabTexturesSources) {
      var texture;
      tabTextures[texName] = texture = this.gl.createTexture();
      texture.image = new Image();
      texture.loadPromise = $.Deferred();
      promises.push(texture.loadPromise);
      texture.image.src = tabTexturesSources[texName].file;
      texture.image.onload = this.handleLoadedTexture(texture).bind(this);
    }
    
    $.when.apply($, promises).done(callback);
    
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
      texture.loadPromise.resolve();
    };
  };

}(Karma.EngineWebGL));
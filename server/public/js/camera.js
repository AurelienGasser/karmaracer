

function Camera(ctx){

  this.ctx = ctx;

  this.translate = {x : 0, y : 0};
  //this.canvasSize = {w : this.ctx.canvas.width, h : this.ctx.canvas.height};

  //this.updateScale();

  this.scale = 1;
  //this.setWorldSize({w:10, h:10});
  this.realWorldSize = {w:0, h:0};
  // take care of browser resizes
  $(window).resize(function(){

    // $('#game-canvas').width($(window).width());
    // $('#game-canvas').height($(window).height());
    game.drawEngine.camera.resizeCanvas({w: $(window).width() , h: $(window).height()});
  });

  // for mobile devices shouls be redone
  //updateOrientation();

}



Camera.prototype.setWorldSize = function(realWorldSize) {
  this.realWorldSize = realWorldSize;
  var canvasSize = this.getCanvasSize();
  this.scaledSized = {w : canvasSize.w * this.scale, h : canvasSize.h * this.scale};
  this.scaleLimits = {min : 0.1, max : 5};  
};

Camera.prototype.updateScale = function (){
  var screenRatio = this.getScreenRatio();
  //carPosY = screenRatio;
  //this.
  //this.scale = screenRatio;
  //this.scale = carPosY;
}


Camera.prototype.getCanvasSize = function() {
  return {w : this.ctx.canvas.width, h : this.ctx.canvas.height};
};


Camera.prototype.resizeCanvas = function(newSize){
  //alert(newSize.w +', '+ newSize.h, ' :canvas:' + this.ctx);
  if (this.ctx != null){
      this.ctx.canvas.width = newSize.w;
      this.ctx.canvas.height = newSize.h;
      $('#game-canvas').width(newSize.w);
      $('#game-canvas').height(newSize.h);

  }

}


Camera.prototype.getScreenRatio = function(){

    var canvasSize = this.getCanvasSize();
    var ratioX = canvasSize.w / this.realWorldSize.w;
    var ratioY = canvasSize.h / this.realWorldSize.h;

    //console.log('canvasSize: ', canvasSize, ', real world : ', this.realWorldSize, ', ratioX : ', ratioX, ' ratioY:', ratioY);
    if (ratioX < ratioY) return ratioX;

    return ratioY;    

}

Camera.prototype.drawDebug = function() {

    var canvasSize = this.getCanvasSize();
    var cameraDebug = [];
    cameraDebug.push('<ul>');
      cameraDebug.push('<li>', 'Canvas Size : ', canvasSize.w, ', ', canvasSize.h, '</li>');
      cameraDebug.push('<li>', 'Translate X : ', this.translate.x, '</li>');
      cameraDebug.push('<li>', 'Translate Y : ', this.translate.y, '</li>');
      cameraDebug.push('<li>', 'Scale : ', this.scale, '</li>');
      cameraDebug.push('<li>', 'Scaled Size : ', this.scaledSized.w, ', ', this.scaledSized.h, '</li>');
      cameraDebug.push('<li>', 'myCar Pos : ', this.center.x, ', ', this.center.y, ', r°:', this.center.r,'</li>');
      cameraDebug.push('<li>', 'Orientation : ',  window.orientation ,'</li>');
      if (window.orientation != null){
        //cameraDebug.push('<li>', 'viewport : ', $(window).width(),', ', $(window).height(),'</li>');
      }
    cameraDebug.push('</ul>');
    $('#camera-debug').html(cameraDebug.join(''));  
};


Camera.prototype.update = function(center) {
  if (center == null) return;
  this.center = center;
  //$('body').append('update');
  //alert('update camera');

  this.updateScale();

  // MIN MAX TO KEEP
  // if (this.scaleLimits.min > this.scale) this.scale = this.scaleLimits.min;
  // if (this.scaleLimits.max < this.scale) this.scale = this.scaleLimits.max;

  var canvasSize = this.getCanvasSize();
  this.scaledSized = {w : canvasSize.w / (this.scale), h : canvasSize.h / (this.scale)};
  
  this.translate.x = this.scaledSized.w / 2 - center.x;
  this.translate.y = this.scaledSized.h / 2 - center.y;

  // do the translate for the oriented view
  this.ctx.translate(0, canvasSize.h);

  // scale the canvas & make the horizontal mirror
  this.ctx.scale(this.scale, -this.scale);

  // translate to center the car
  this.ctx.translate(this.translate.x, this.translate.y);

  this.drawDebug();
  

  
  //this.ctx.translate(200, 200);
  
  //this.ctx.scale(this.scale, this.scale);
};

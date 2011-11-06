var camera = null;

var carPosY = 1.9;
var cameraHeight = 0;
var xPos = 0;
var yPos = 0;
var zPos = 0;


function hasWebGL(canvas){
  try {
    gl = canvas.getContext("experimental-webgl", { antialias: false});
    canvas.width = $('#game-canvas').width() - 10;
    canvas.height = $('#game-canvas').height();
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    return true;
  }
  catch (e) {
  	//console.log('no-gl');
    return false;
  }
}

function initDrawEngine(canvasID){
	var canvas = document.getElementById(canvasID);

  switch(drawEngine){
    case 'WEBGL' :
      if (hasWebGL(canvas)){
        drawEngine = "WEBGL";
        webGLStart();
        $('#camera-debug').css('display', 'none');
      } else {
        drawEngine = "CANVAS";
        initDrawEngine(canvasID);
      }
    break;
    case 'CANVAS' :
        init2DCanvas(canvasID);    
    break;
  }


	//console.log('draw engine : ', drawEngine);
}

function init2DCanvas(selector){
	var canvas = document.getElementById(selector);
	var ctx = canvas.getContext("2d");
    canvas.width = $('#' + selector).width();
    canvas.height = $('#' + selector).height();

	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;
	$('#loadingtext').html('');
  camera = new Camera(ctx, {w:800, h :600});
	tick2DCanvas();
}

function tick2DCanvas() {
  requestAnimFrame(tick2DCanvas);
  handleKeys();
  
  drawCarsInCanvas(cars, "game-canvas");

}

/**
 * Provides requestAnimationFrame in a cross browser way.
 */
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
           window.setTimeout(callback, 1000/60);
         };
})();




function Camera(ctx, realWorldSize){

  this.ctx = ctx;

  this.translate = {x : 0, y : 0};

  this.realWorldSize = realWorldSize;
  //this.canvasSize = {w : this.ctx.canvas.width, h : this.ctx.canvas.height};

  this.updateScale();

  var canvasSize = this.getCanvasSize();
  this.scaledSized = {w : canvasSize.w * this.scale, h : canvasSize.h * this.scale};
  this.scaleLimits = {min : 0.1, max : 5};
  

  // take care of browser resizes
  $(window).resize(function(){

    // $('#game-canvas').width($(window).width());
    // $('#game-canvas').height($(window).height());
    camera.resizeCanvas({w: $(window).width() , h: $(window).height()});
  });

  this.update();
}

Camera.prototype.updateScale = function (){
  var screenRatio = this.getScreenRatio();;
  carPosY = screenRatio;
  this.scale = screenRatio;
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
      // this.updateScale();
      // var screenRatio = this.getScreenRatio();;
      
      // carPosY = screenRatio;
      // this.scale = screenRatio;        
      //this.drawDebug();
      //this.update();
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
      cameraDebug.push('<li>', 'myCar Pos : ', mycar.x, ', ', mycar.y, ', r°:', mycar.r,'</li>');
      cameraDebug.push('<li>', 'Orientation : ',  window.orientation ,'</li>');
      if (window.orientation != null){
        //cameraDebug.push('<li>', 'viewport : ', $(window).width(),', ', $(window).height(),'</li>');
      }
    cameraDebug.push('</ul>');
    $('#camera-debug').html(cameraDebug.join(''));  
};


Camera.prototype.update = function() {
  

  //$('body').append('update');
  //alert('update camera');
  if (mycar != null){
    this.updateScale();
    //console.log(this, mycar, carPosY);
    // MIN MAX TO KEEP
    // if (this.scaleLimits.min > this.scale) this.scale = this.scaleLimits.min;
    // if (this.scaleLimits.max < this.scale) this.scale = this.scaleLimits.max;

    //this.canvasSize = {w : this.ctx.canvas.width, h : this.ctx.canvas.height};
    
    var canvasSize = this.getCanvasSize();
    this.scaledSized = {w : canvasSize.w * (1/ this.scale), h : canvasSize.h * (1/this.scale)};
    this.translate.x = -mycar.x - mycar.w / 2 + canvasSize.w / 2;
    this.translate.y = -mycar.y - mycar.h / 2 + canvasSize.h / 2;
    
    this.ctx.scale(this.scale, this.scale);

    //this.ctx.translate( this.scaledSized.w / 2,  this.scaledSized.h / 2); 
    //this.ctx.translate(this.translate.x, this.translate.y); 


    this.drawDebug();
  }

  
  //this.ctx.translate(200, 200);
  
  //this.ctx.scale(this.scale, this.scale);
};

var carImage = new Image();
carImage.src = '/sprites/caronly.png';

function drawCarsInCanvas(cars, selector){
	try
	{
      //console.log(cars);
  		var canvas = document.getElementById(selector);
  		var ctx = canvas.getContext("2d");
	    ctx.canvas.width = $('#' + selector).width();
	    ctx.canvas.height = $('#' + selector).height();
	    //console.log('cars received, ', cars.length);
		  //ctx.clearRect(0, 0, 800, 600);
      camera.update();  

      if (cars != null){
        _.each(cars, function(c) {
          //ctx.strokeStyle = "#0F0";
          //ctx.strokeRect(c.x, c.y, c.w, c.h );

          ctx.save();
          ctx.translate(c.x +  c.w / 2, c.y + c.h / 2);
          ctx.rotate(-c.r);
          //ctx.fillStyle = "#F00";
          //ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
          //ctx.fillStyle = "#000";
          //ctx.fillRect(-c.w / 2, c.h - c.h / 2 - 10, c.w, 10);
          ctx.drawImage(carImage, -c.w / 2, -c.h / 2, c.w, c.h);
          //ctx.drawImage(carImage,44, 32, 36, 66, -c.w / 2, -c.h / 2, c.w, c.h);
          ctx.restore();
        });        
      }



    var i = 0;
    var colors = ['#F00', '#FF0', '#FF', '#0FF' ];
    if (walls != null){
      _.each(walls, function(c) {
        
        //ctx.save();
        //ctx.translate(c.x, c.y );
        //ctx.rotate(-c.r);
        ctx.fillStyle = colors[i];
        ctx.fillRect(c.x, c.y, c.w, c.h);
        i += 1;
  //      ctx.drawImage(carImage,44, 32, 36, 66, -c.w / 2, -c.h / 2, c.w, c.h);
        //ctx.restore();
      });      
    }


	} catch (e) {
    	console.log('Unable to Load Canvas', e);
  	}

}


/*
var cameraCanvas = {
	canvasID : 'game-canvas',
	canvas : null,
	ctx : null,
	init : function(canvasSelector){
		$(canvasSelector)
	},
	applyChanges : function (){

	}
}
*/
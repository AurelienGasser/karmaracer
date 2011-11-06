
var drawEngine = "WEBGL";
var camera = null;

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
	if (hasWebGL(canvas)){
		drawEngine = "WEBGL";
		webGLStart();
    $('#camera-debug').css('display', 'none');
	} else {
		drawEngine = "CANVAS";
		init2DCanvas(canvasID);
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
  camera = new Camera(ctx);
	tick2DCanvas();
}

function tick2DCanvas() {
  requestAnimFrame(tick2DCanvas);
  handleKeys();
  
  drawCarsInCanvas(cars, "game-canvas");

}



function Camera(ctx){

  this.ctx = ctx;

  this.translate = {x : 0, y : 0};
  this.scale = 1.2;
  this.canvasSize = {w : this.ctx.canvas.width, h : this.ctx.canvas.height};
  this.scaledSized = {w : this.canvasSize.w * this.scale, h : this.canvasSize.h * this.scale};
  this.scaleLimits = {min : 0.1, max : 5};
}

Camera.prototype.update = function() {
  
  if (mycar != null){
    //console.log(this, mycar, carPosY);
    this.scale = carPosY;
    if (this.scaleLimits.min > this.scale) this.scale = this.scaleLimits.min;
    if (this.scaleLimits.max < this.scale) this.scale = this.scaleLimits.max;

    this.canvasSize = {w : this.ctx.canvas.width, h : this.ctx.canvas.height};
    this.scaledSized = {w : this.canvasSize.w * (1/ this.scale), h : this.canvasSize.h * (1/this.scale)};
    this.translate.x = -mycar.x - mycar.w / 2 + this.canvasSize.w / 2;
    this.translate.y = -mycar.y - mycar.h / 2 + this.canvasSize.h / 2;
    
    this.ctx.scale(this.scale, this.scale);

    //this.ctx.translate( this.scaledSized.w / 2,  this.scaledSized.h / 2); 
    //this.ctx.translate(this.translate.x, this.translate.y); 


    var cameraDebug = [];
    cameraDebug.push('<ul>');
      cameraDebug.push('<li>', 'Canvas Size : ', this.canvasSize.w, ', ', this.canvasSize.h, '</li>');
      cameraDebug.push('<li>', 'Translate X : ', this.translate.x, '</li>');
      cameraDebug.push('<li>', 'Translate Y : ', this.translate.y, '</li>');
      cameraDebug.push('<li>', 'Scale : ', this.scale, '</li>');
      cameraDebug.push('<li>', 'Scaled Size : ', this.scaledSized.w, ', ', this.scaledSized.h, '</li>');
      cameraDebug.push('<li>', 'myCar Pos : ', mycar.x, ', ', mycar.y, ', r°:', mycar.r,'</li>');
    cameraDebug.push('</ul>');
    $('#camera-debug').html(cameraDebug.join(''));
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


    var i = 0;
    var colors = ['#F00', '#FF0', '#FF', '#0FF' ];
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
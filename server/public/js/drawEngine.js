
var drawEngine = "WEBGL";


function hasWebGL(canvas){	
  try {
    var gl = canvas.getContext("experimental-webgl", { antialias: false});
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
		webGLStart(canvasID);

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

	tick2DCanvas();
}

function tick2DCanvas() {
  requestAnimFrame(tick2DCanvas);
  handleKeys();
  drawCarsInCanvas(cars, "game-canvas");
}


//Image carImage = new Image();
//carImage.src = "../sprites/car.png";

function drawCarsInCanvas(cars, selector){
	try
	{
		var canvas = document.getElementById(selector);
		var ctx = canvas.getContext("2d");
	    ctx.canvas.width = $('#' + selector).width();
	    ctx.canvas.height = $('#' + selector).height();
	    //console.log('cars received, ', cars.length);	
		//ctx.clearRect(0, 0, 800, 600);
		
		_.each(cars, function(c) {
			//ctx.strokeStyle = "#0F0";
			//ctx.strokeRect(c.x, c.y, c.w, c.h );
			
			ctx.save();
			//ctx.translate(-c.x - c.w / 2, -c.y - c.h / 2);
			ctx.translate(c.x +  c.w / 2, c.y + c.h / 2);
			ctx.rotate(-c.r);
			//ctx.translate(-c.x - c.w / 2, -c.y - c.h / 2);
			//ctx.translate(-c.x, -c.y);
			//ctx.drawImage(carImage, ) 
			ctx.fillStyle = "#F00";
			ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
			ctx.fillStyle = "#000";
			ctx.fillRect(-c.w / 2, c.h - c.h / 2 - 10, c.w, 10);
			ctx.restore();

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
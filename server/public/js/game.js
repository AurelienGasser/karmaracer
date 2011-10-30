$(function(){

	webGLStart();
	initSockets();
	//init2DCanvas("game-canvas");
	//drawCarsInCanvas(cars, 'game-canvas');

	$(window).resize(function(){
	  var canvas = document.getElementById("game-canvas");
	  initGL(canvas);		
	});
});


function init2DCanvas(selector){
	var canvas = document.getElementById(selector);
	var ctx = canvas.getContext("2d");
    canvas.width = $('#' + selector).width();
    canvas.height = $('#' + selector).height();

	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;

}

function drawCarsInCanvas(cars, selector){
	try
	{
		handleKeys();
		var canvas = document.getElementById(selector);
		var ctx = canvas.getContext("2d");
	    canvas.width = $('#' + selector).width();
	    canvas.height = $('#' + selector).height();
	    //console.log('cars received, ', cars.length);	
		//ctx.clearRect(0, 0, 800, 600);
		ctx.fillStyle = "#F00";
		_.each(cars, function(c) {
			ctx.save();
			ctx.translate(c.x + c.w / 2, c.y + c.h / 2);
			ctx.rotate(c.r);
			ctx.fillRect(-c.w / 2, -c.y / 2, c.w, c.h);
			ctx.restore();
		});

	} catch (e) {
    	console.log('Unable to Load Canvas', e);
  	}

}
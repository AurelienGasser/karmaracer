var camera = null;

var carPosY = 1;
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
  camera = new Camera(ctx);
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



var carImage = new Image();
carImage.src = '/sprites/caronly.png';

function drawCarsInCanvas(cars, selector){
	try
	{
  		var canvas = document.getElementById(selector);
  		var ctx = canvas.getContext("2d");
	    ctx.canvas.width = $('#' + selector).width();
	    ctx.canvas.height = $('#' + selector).height();
	    //console.log('cars received, ', cars.length);
    

      ctx.rotate(-Math.PI / 2);
      ctx.translate(-camera.realWorldSize.w, 0);

      
		  //ctx.clearRect(0, 0, 800, 600);
      camera.update();  

      if (cars != null){
        _.each(cars, function(c) {
          ctx.save();
          ctx.translate(c.x,c.y);
          ctx.rotate(-c.r);
          //ctx.drawImage(carImage, 44, 32, 36, 66, -c.w / 2, -c.h / 2, c.w, c.h);
          ctx.drawImage(carImage, -c.w / 2, -c.h / 2, c.w, c.h);
          //ctx.fillStyle = "#F00";          
          //ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
          ctx.restore();
        });        
      }

    var i = 0;
    var colors = ['#F00', '#FF0', '#FEE', '#0FF', '#FFF'];
    if (walls != null){
      _.each(walls, function(c) {
        ctx.fillStyle = colors[i];
        ctx.fillRect(c.x -c.w / 2 , c.y - c.h / 2, c.w, c.h);
        i += 1;
      });      
    }


	} catch (e) {
    	console.log('Unable to Load Canvas', e);
  	}

}



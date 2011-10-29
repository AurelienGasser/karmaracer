

$(function(){

	webGLStart();
	initSockets();	

	$(window).resize(function(){
	  var canvas = document.getElementById("game-canvas");
	  initGL(canvas);		
	});
});



$(function(){

	webGLStart();
	intiSockets();	

	$(window).resize(function(){
	  var canvas = document.getElementById("game-canvas");
	  initGL(canvas);		
	});
});

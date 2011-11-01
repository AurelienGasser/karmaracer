$(function(){

	//webGLStart();

	initDrawEngine("game-canvas");
	initSockets();

	$(window).resize(function(){
	  var canvas = document.getElementById("game-canvas");
	  //initGL(canvas);		
	});
});



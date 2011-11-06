//document.body.addEventListener('touchmove', function(e){ e.preventDefault(); });


function updateOrientation(){
  


  //alert($(window).width()+ ', '+$(window).height());
  //alert('orientation changed');
  //$('#game-canvas').width($(window).width()); 
  //$('#game-canvas').height($(window).height());
  if (camera != null){
    //alert('wtf?');
    //$('body').append({w:$(window).width(), h:$(window).height()});
    camera.resizeCanvas({w:$(window).width(), h:$(window).height()});
    //camera.update();
  }else{
    //alert('camera is null');
  }
  
}

var driveSide = 0;
var diff_driveSide = 0;
var accelerationTouch = 0;
var localAcceleration = 0;
var maxTurn = 0.5;
$(function(){


  setInterval(function(){
    if(nodeserver != null){


      //if (localAcceleration < -0.2) localAcceleration = 0.2;
      diff_driveSide /= 100;

      if (diff_driveSide <= -maxTurn) diff_driveSide = -maxTurn;
      if (diff_driveSide >= maxTurn) diff_driveSide = maxTurn;
      $('#touch-debug').html('turn: '+  diff_driveSide + ", acc:" + localAcceleration);
      nodeserver.emit('accelerate', localAcceleration);  
      nodeserver.emit('turnCar', diff_driveSide);  
    }
  }, 10);

  updateOrientation();
  //alert('welcome');
  //document.ontouchmove = function(e){ e.preventDefault();}
  window.ontouchmove = function(e){ e.preventDefault();}

  $('#pad-top').bind('touchstart', function(event){
    accelerationTouch = event.pageY;
  });

  $('#pad-top').bind('touchmove', function(event){
    localAcceleration = accelerationTouch - event.pageY;   
  });

  $('#pad-top').bind('touchend', function(){
    localAcceleration = 0;   
  });


  
  $('#pad-left').bind('touchstart', function(event){
    driveSide = event.pageX;
  });

  $('#pad-left').bind('touchmove', function(event){
    diff_driveSide = driveSide - event.pageX; 
    
  });

  $('#pad-left').bind('touchend', function(){
    diff_driveSide = 0;   
  });



});
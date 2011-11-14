var driveSide = 0;
var diff_driveSide = 0;
var accelerationTouch = 0;
var localAcceleration = 0;
var maxTurn = 3;
var MOBILE_DEVICE = true;

function updateOrientation(){
  if (game.drawEngine.camera != null){
    game.drawEngine.camera.resizeCanvas({w:$(window).width(), h:$(window).height()});
  }
}

$(function(){
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
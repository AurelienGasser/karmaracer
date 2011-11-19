var driveSide = 0;
var diff_driveSide = 0;
var accelerationTouch = 0;
var localAcceleration = 0;
var zoomLevel = 1;
var diff_zoomLevel = 0;
var maxTurn = 3;

function updateOrientation(){
  if (G_game.drawEngine.camera != null){
    //console.log('update orientation')
    G_game.drawEngine.camera.resizeCanvas({w:$(window).width(), h:$(window).height()});
  }
}

function handleKeysMobile() {
  window.ontouchmove = function(e){ e.preventDefault();}
  window.touchstart = function(e){ e.preventDefault();}


  $('#pad-top').bind('touchstart', function(event){
    accelerationTouch = event.pageY;
  });
  $('#pad-top').bind('touchmove', function(event){
    localAcceleration = accelerationTouch - event.pageY;
    //G_game.socketManager.getConnection().emit('drive', {'accelerate' :localAcceleration, 'turnCar': diff_driveSide});
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
  $('#pad-zoom').bind('touchstart', function(event){
    zoomLevel = event.pageX;
  });
  $('#pad-zoom').bind('touchmove', function(event){
    diff_zoomLevel = zoomLevel - event.pageX;
    var zoomFactor = 0.95;
    if (diff_zoomLevel < 0){
      var zoomFactor = 1.05;
    }
    G_game.drawEngine.camera.scale *= zoomFactor;
  });
  $('#pad-zoom').bind('touchend', function(){


    diff_zoomLevel = 0;
  });

}

/*
 * Compatibility
 */

if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }
    var fSlice = Array.prototype.slice,
    aArgs = fSlice.call(arguments, 1),
    fToBind = this,
    fNOP = function () {},
    fBound = function () {
      return fToBind.apply(this instanceof fNOP
        ? this
        : oThis || window,
        aArgs.concat(fSlice.call(arguments)));
      };
      fNOP.prototype = this.prototype;
      fBound.prototype = new fNOP();
      return fBound;
    };
}

/*
 * Keyboard
 */
setInterval(function(){
  if (diff_driveSide != 0 || localAcceleration != 0){
    if(G_game.socketManager.getConnection() != null){
      if (diff_driveSide <= -maxTurn) diff_driveSide = -maxTurn;
      if (diff_driveSide >= maxTurn) diff_driveSide = maxTurn;
      $('#touch-debug').html('turn: '+  diff_driveSide + ", acc:" + localAcceleration);
      G_game.socketManager.getConnection().emit('drive', {'accelerate' :localAcceleration, 'turnCar': diff_driveSide});
    }
  }
}, 5);

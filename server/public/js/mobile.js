function MobileTerminalHandler() {
  return this;
}

MobileTerminalHandler.prototype.init = function() {
  $("head").append('<link rel="apple-touch-icon" href="/images/karmaracer-logo.png"/>');
  $("body").attr('onorientationchange', "updateOrientation();");
  $("body").append('<div id="camera-debug"/>');
  this.addTouchScreenAreas();
  this.initTouchScreenEvents();
}

MobileTerminalHandler.prototype.addTouchScreenAreas = function() {
  $("body").append('<div id="touch-debug">toto</div>');
  $("body").append('<div id="pad-left" class="pad">LEFT</div>');
  $("body").append('<div id="pad-right" class="pad">RIGHT</div>');
  $("body").append('<div id="pad-forward" class="pad">FORWARD</div>');
  $("body").append('<div id="pad-backward" class="pad">BACKWARD</div>');
  $("body").append('<div id="pad-zoom" class="pad">ZOOM</div>');
}

MobileTerminalHandler.prototype.initTouchScreenEvents = function() {
  window.ontouchmove = function(e){ e.preventDefault();}
  window.touchstart = function(e){ e.preventDefault();}
  $('#pad-forward').bind('touchstart', function(event){
     G_game.keyboardHandler.event('forward', 'start');
   });
   $('#pad-forward').bind('touchend', function(){
     G_game.keyboardHandler.event('forward', 'end');
   });
   $('#pad-backward').bind('touchstart', function(event){
     G_game.keyboardHandler.event('backward', 'start');
   });
   $('#pad-backward').bind('touchend', function(){
     G_game.keyboardHandler.event('backward', 'end');
   });
   $('#pad-left').bind('touchstart', function(event){
     G_game.keyboardHandler.event('left', 'start');
   });
   $('#pad-left').bind('touchend', function(){
     G_game.keyboardHandler.event('left', 'stop');
   });
   $('#pad-right').bind('touchstart', function(event){
     G_game.keyboardHandler.event('right', 'start');
   });
   $('#pad-right').bind('touchend', function(){
     G_game.keyboardHandler.event('right', 'stop');
   });
   $('#pad-zoom').bind('touchstart', function(event){
    this.zoomLevel = event.pageX;
  });
  $('#pad-zoom').bind('touchmove', function(event){
    var zoomFactor;
    if (this.zoomLevel - event.pageX < 0){
      var zoomFactor = 1.05;
    } else {
      zoomFactor = 0.95;
    }
    G_game.drawEngine.camera.scale *= zoomFactor;
  });
}

function updateOrientation(){
  if (G_game.drawEngine.camera != null){
    G_game.drawEngine.camera.resizeCanvas({w:$(window).width(), h:$(window).height()});
  }
}

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
      return fToBind.apply(this instanceof fNOP ? this : oThis || window,
        aArgs.concat(fSlice.call(arguments)));
    };
    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
    return fBound;
  };
}


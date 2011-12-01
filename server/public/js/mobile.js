function MobileTerminalHandler() {
  return this;
}

MobileTerminalHandler.prototype.init = function() {
  $("head").append('<link rel="apple-touch-icon" href="/images/karmaracer-logo.png"/>');
  $("body").attr('onorientationchange', "updateOrientation();");
  $("body").append('<div id="camera-debug"/>');
  this.touch = {
    forward: false,
    backward: false,
    left: false,
    right: false
  }
  this.addTouchScreenAreas();
  this.initTouchScreenEvents();
}

MobileTerminalHandler.prototype.addTouchScreenAreas = function() {
  $("body").append('<div id="touch-debug">toto</div>');
  $("body").append('<div id="pad-turn" class="pad">TURN</div>');
  $("body").append('<div id="pad-accelerate" class="pad">ACCELERATE</div>');
  $("body").append('<div id="pad-zoom" class="pad">ZOOM</div>');
}


// Turn left, stop turning or turn right depending on the event position
MobileTerminalHandler.prototype.touchEventTurn = function(event) {
  if (
    event.originalEvent.targetTouches[0].pageY < event.target.offsetTop
    || event.originalEvent.targetTouches[0].pageY > event.target.offsetTop + event.target.clientHeight
    || event.originalEvent.targetTouches[0].pageX < event.target.offsetLeft
    || event.originalEvent.targetTouches[0].pageX > event.target.offsetLeft + event.target.clientWidth
  ) {
    this.userTurn('stop');
  } else if (event.originalEvent.targetTouches[0].pageX < event.target.offsetLeft + event.target.clientWidth / 2) {
    this.userTurn('left');
  } else {
    this.userTurn('right');
  }
}

// Accelerate, stop or descelerate depending on the event position
MobileTerminalHandler.prototype.touchEventAccelerate = function(event) {
  if (
    event.originalEvent.targetTouches[0].pageY < event.target.offsetTop
    || event.originalEvent.targetTouches[0].pageY > event.target.offsetTop + event.target.clientHeight
    || event.originalEvent.targetTouches[0].pageX < event.target.offsetLeft
    || event.originalEvent.targetTouches[0].pageX > event.target.offsetLeft + event.target.clientWidth
  ) {
    this.userAccelerate('stop');
  } else if (event.originalEvent.targetTouches[0].pageY < event.target.offsetTop + event.target.clientHeight / 2) {
    this.userAccelerate('forward');
  } else {
    this.userAccelerate('backward');
  }
}

// Send a turn instruction to the server if necessary
MobileTerminalHandler.prototype.userTurn = function(direction) {
  switch (direction) {
    case 'stop':
      if (this.touch.left) G_game.keyboardHandler.event('left', 'end');
      if (this.touch.right) G_game.keyboardHandler.event('right', 'end');
      break;
    case 'left':
      if (this.touch.right) G_game.keyboardHandler.event('right', 'end');
      if (!this.touch.left) G_game.keyboardHandler.event('left', 'start');
      break;
    case 'right':
      if (this.touch.left) G_game.keyboardHandler.event('left', 'end');
      if (!this.touch.right) G_game.keyboardHandler.event('right', 'start');
      break;
  }
  this.touch.left = false;
  this.touch.right = false;
  if (direction != 'stop') this.touch[direction] = true;
}

// Send an accelerate instruction to the server if necessary
MobileTerminalHandler.prototype.userAccelerate = function(direction) {
  switch (direction) {
    case 'stop':
      if (this.touch.forward) G_game.keyboardHandler.event('forward', 'end');
      if (this.touch.backward) G_game.keyboardHandler.event('backward', 'end');
      break;
    case 'forward':
      if (this.touch.backward) G_game.keyboardHandler.event('backward', 'end');
      if (!this.touch.forward) G_game.keyboardHandler.event('forward', 'start');
      break;
    case 'backward':
      if (this.touch.forward) G_game.keyboardHandler.event('forward', 'end');
      if (!this.touch.backward) G_game.keyboardHandler.event('backward', 'start');
      break;
  }
  this.touch.forward = false;
  this.touch.backward = false;
  if (direction != 'stop') this.touch[direction] = true;
}

MobileTerminalHandler.prototype.initTouchScreenEvents = function() {
  window.ontouchmove = function(e){ e.preventDefault();}
  window.touchstart = function(e){ e.preventDefault();}
  $('#pad-accelerate').bind('touchstart', function(event){
    this.touchEventAccelerate(event);
  }.bind(this));
  $('#pad-accelerate').bind('touchend', function(){
    this.userAccelerate('stop');
  }.bind(this));
  $('#pad-accelerate').bind('touchmove', function(event){
    this.touchEventAccelerate(event);
  }.bind(this));
  $('#pad-turn').bind('touchstart', function(event){
    this.touchEventTurn(event);
  }.bind(this));
  $('#pad-turn').bind('touchend', function(){
    this.userTurn('stop');
  }.bind(this));
  $('#pad-turn').bind('touchmove', function(event){
    this.touchEventTurn(event);
  }.bind(this));
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


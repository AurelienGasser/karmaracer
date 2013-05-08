(function() {
  "use strict";
  var SteeringWheelController = function() {
    //gameInstance
    // this.init(gameInstance);

  };

  SteeringWheelController.prototype.init = function(gameInstance) {
    this.m = $('<div id="SteeringWheelController"/>');
    this.acc = $('<div id="SteeringWheelControllerAcc"/>');

    this.m.append(this.acc);

    this.enable = false;
    $('body').append(this.m);
    this.gameInstance = gameInstance;
    this.gameInstance.steeringWheel = this;
    this.resize();
    this.accSize = {
      w: this.acc.width(),
      h: this.acc.height()
    };

    this.force = {
      x: 0,
      y: 0
    };

    this.updateCenter();

    var that = this;


    var toogleEnable = function() {
      var jWheel = $(this);
      jWheel.toggleClass('enable');
      that.enable = jWheel.hasClass('enable');
    };

    that.m.click(toogleEnable);

    $(window).resize(function() {
      that.resize();
    });

    window.onorientationchange = function() {
      // alert('update');
      that.resize();
    };

    window.webkitfullscreenchange = function() {
      // alert('o??');
    };

    var interval = null;



    var send = function() {
      if (!that.enable) {
        return;
      }
      that.gameInstance.socketManager.emit('move_car', {
        'force': that.force,
        'angle': angle(that.force)
      });
    };

    var startAcceleration = function() {
      if (interval === null) {
        interval = setInterval(send, 1000 / 16);
      }

    };
    var stopAcceleration = function() {
      clearInterval(interval);
      interval = null;
    };



    function angle(b) {
      if (b === null) {
        return 0;
      }
      var a = {
        'x': 0,
        'y': 0
      };
      var res = Math.atan2(b.y, b.x) - Math.atan2(a.y, a.x);
      if (_.isNaN(res)) {
        res = 0;
      }
      return res;
    }


    var hover = function(e) {


      var mousePosition = {
        x: e.pageX,
        y: e.pageY
      };

      if (that.gameInstance.isMobile) {
        mousePosition.x = e.originalEvent.touches[0].pageX;
        mousePosition.y = e.originalEvent.touches[0].pageY;
      }

      var x = mousePosition.x - that.mCenter.x;
      var y = mousePosition.y - that.mCenter.y;

      that.acc.css('left', mousePosition.x - that.m.position().left - (that.accSize.w / 2));
      that.acc.css('top', mousePosition.y - that.m.position().top - (that.accSize.h / 2));

      var force = {
        'x': (x / (that.mSize.w / 2)),
        'y': (y / (that.mSize.h / 2))
      };
      var accHelper = 10;
      if (that.gameInstance.isMobile) {
        accHelper = 5;
      }
      force.x *= accHelper;
      force.y *= accHelper;
      that.force = force;
    };
    if (that.gameInstance.isMobile) {
      that.m.bind('touchstart', startAcceleration);
      that.m.bind('touchend', stopAcceleration);
      that.m.bind('touchmove', hover);
      that.enable = true;
    } else {
      that.m.mousemove(hover);
      that.m.hover(startAcceleration, stopAcceleration);
    }
    that.acc.mousemove(function(e) {
      e.preventDefault();
      return false;
    });

  };

  SteeringWheelController.prototype.setMSize = function(w, h) {
    var that = this;

    that.m.css('width', w + 'px');
    that.m.css('height', h + 'px');

    that.mSize = {
      w: that.m.width(),
      h: that.m.height()
    };

    that.updateCenter();
  };



  SteeringWheelController.prototype.updateCenter = function() {

    var that = this;

    that.mSize = {
      w: that.m.width(),
      h: that.m.height()
    };
    that.mCenter = {
      x: that.mSize.w / 2 + that.m.position().left,
      y: that.mSize.h / 2 + that.m.position().top
    };
  };

  SteeringWheelController.prototype.setMPosition = function(x, y) {
    var that = this;
    var mX = x - that.mSize.w / 2;
    var mY = y - that.mSize.h / 2;
    that.m.css('left', mX + 'px');
    that.m.css('top', mY + 'px');
    that.updateCenter();
  };



  SteeringWheelController.prototype.resize = function() {
    this.m.css({
      'width': '100%',
      'height': '100%'
    });
    // this.setMSize(this.m.width(), this.m.height());
    // this.setMPosition(window.innerWidth / 2, window.innerHeight / 2);
  };

  Karma.SteeringWheelController = SteeringWheelController;

}());
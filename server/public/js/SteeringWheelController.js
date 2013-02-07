var SteeringWheelController = function(gameInstance) {

    console.log('gameInstance', gameInstance);
    this.m = $('<div id="SteeringWheelController"/>');
    this.acc = $('<div id="SteeringWheelControllerAcc"/>');

    this.m.append(this.acc);

    this.enable = false;
    $('body').append(this.m);
    this.gameInstance = gameInstance;
    this.gameInstance.steeringWheel = this;
    this.resize();
    // var s = 10;
    // setMSize(s, s);
    // if(!that.gameInstance.isMobile) {
    //   this.setMPosition(window.innerWidth / 2, window.innerHeight / 2);
    //   // setMPosition(s / 2, s / 2);
    // } else {
    //   this.resize();
    // }
    this.accSize = {
      w: this.acc.width(),
      h: this.acc.height()
    };

    this.force = {
      x: 0,
      y: 0
    };



    var that = this;


    that.m.click(function(e) {
      var jWheel = $(this);
      jWheel.toggleClass('enable');
      that.enable = jWheel.hasClass('enable');
      console.log(that.enable);
    });

    $(window).resize(function() {
      that.m.css({'width' : '100%', 'height' : '100%'});
    });



    var interval = null;



    var send = function() {
        if(!that.enable) {
          return;
        }
        console.log('send', that.force.x);
        that.gameInstance.socketManager.emit('move_car', {
          'force': that.force,
          'angle': angle(that.force)
        });
      }

    var startAcceleration = function(e) {
        if(interval === null) {
          interval = setInterval(send, 1000 / 16);
        }

      }
    var stopAcceleration = function(e) {
        clearInterval(interval);
        interval = null;
      }



    function angle(b) {
      if(b === null) {
        return 0;
      }
      a = {
        'x': 0,
        'y': 0
      };
      res = Math.atan2(b.y, b.x) - Math.atan2(a.y, a.x);
      if(_.isNaN(res)) {
        res = 0;
      }
      return res;
    }


    var hover = function(e) {


        var mousePosition = {
          x: e.pageX,
          y: e.pageY
        };

        if(that.gameInstance.isMobile) {
          mousePosition.x = e.originalEvent.touches[0].pageX;
          mousePosition.y = e.originalEvent.touches[0].pageY;
        }

        var x = mousePosition.x - that.mCenter.x;
        var y = mousePosition.y - that.mCenter.y;

        that.acc.css('left', mousePosition.x - that.m.position().left - (that.accSize.w / 2));
        that.acc.css('top', mousePosition.y - that.m.position().top - (that.accSize.h / 2))

        var force = {
          'x': (x / (that.mSize.w / 2)),
          'y': (y / (that.mSize.h / 2))
        }
        var accHelper = 20;
        if(that.gameInstance.isMobile) {
          accHelper = 5;
        }


        force.x *= accHelper;
        force.y *= accHelper;
        that.force = force;

        //alert(force.x);
      };

    console.log('is mobile', that.gameInstance.isMobile);


    if(that.gameInstance.isMobile) {
      that.m.bind('touchstart', startAcceleration);
      that.m.bind('touchend', stopAcceleration);
      that.m.bind('touchmove', hover);
    } else {
      that.m.mousemove(hover);
      that.m.hover(startAcceleration, stopAcceleration);
    }
    that.acc.mousemove(function(e) {
      e.preventDefault();
      return false;
    })


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
  that.mCenter = {
    x: that.mSize.w / 2 + that.m.position().left,
    y: that.mSize.h / 2 + that.m.position().top
  }
};

SteeringWheelController.prototype.setMPosition = function(x, y) {
  var that = this;
  var mX = x - that.mSize.w / 2;
  var mY = y - that.mSize.h / 2;
  console.log('set position', mX, mY);
  that.m.css('left', mX + 'px');
  that.m.css('top', mY + 'px');
  that.updateCenter();
}



SteeringWheelController.prototype.resize = function() {
  console.log('resize', window.innerWidth, window.innerHeight);
  this.setMSize(this.m.width(), this.m.height());
  this.setMPosition(window.innerWidth / 2, window.innerHeight / 2);

};
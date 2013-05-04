  function createSVGElement(name) {
    var NS = "http://www.w3.org/2000/svg";
    var SVGObj = document.createElementNS(NS, name);
    return SVGObj;
  }


  Map.prototype.svgRaphaelAddItem = function(item) {

    item.position.x -= item.size.w / 2;
    item.position.y -= item.size.h / 2;

    var that = this;
    var opacityStart = 1;
    var opacityDrag = 0.5;
    var c = this.R.rect(item.position.x, item.position.y, item.size.w, item.size.h).attr({
      //fill: "hsb(.8, 1, 1)",
      fill: "url('" + item.image.src + "')",
      stroke: "none",
      opacity: opacityStart,
      cursor: "move"
    });
    var size = 32;

    var s = this.R.rect(item.position.x + item.size.w - size, item.position.y + item.size.h - size, size, size).attr({
      fill: "hsb(0.8, 0.5, .5)",
      stroke: "none",
      opacity: opacityStart
    });


    var li = $('<li></li>');


    function getJOption(optName) {
      var opt = $('<div><a href="#">' + optName + '</a></div>');
      return opt;
    }

    function addOption(optName) {
      var opt = getJOption(optName);
      opt.click(function(e) {

        if (optName === 'toFront') {
          c[optName]();
          s[optName]();
        } else {
          s[optName]();
          c[optName]();
          that.bgImg.toBack();
        }

        e.preventDefault();
        return false;
      });
      li.append(opt);
    }

    addOption('toFront');
    addOption('toBack');
    var remove = getJOption('removeItem');
    li.append(remove);
    // li.append('size' + JSON.stringify(c.sizer) + c.sizer.attr('x'));
    // li.append('</br>pos' + JSON.stringify(item.position));
    remove.click(function(e) {
      that.removeMapItem(item.id);
      $(c.node).remove();
      $(s.node).remove();
    });

    c.li = li;
    $('#canvas-debug').append(li);
    $('#canvas-debug').children().hide();

    // start, move, and up are the drag functions
    var start = function() {
      // storing original coordinates
      this.ox = this.attr("x");
      this.oy = this.attr("y");
      this.attr({
        opacity: opacityDrag
      });

      this.sizer.ox = this.sizer.attr("x");
      this.sizer.oy = this.sizer.attr("y");
      this.sizer.attr({
        opacity: opacityStart
      });
    };
    var move = function(dx, dy) {
      // move will be called with dx and dy
      this.attr({
        x: this.ox + dx,
        y: this.oy + dy
      });
      item.position.x = this.ox + dx;
      item.position.y = this.oy + dy;
      this.sizer.attr({
        x: this.sizer.ox + dx,
        y: this.sizer.oy + dy
      });
      if (item.position.x < 0) {
        // this.sizer.attr('x', 0);
        item.position.x = 0;
      }
      if (item.position.y < 0) {
        // this.sizer.attr('y', 0);
        item.position.y = 0;
      }


    };
    var up = function() {
      // restoring state
      this.attr({
        opacity: opacityStart
      });
      this.sizer.attr({
        opacity: opacityStart
      });
    };
    var rstart = function() {
      // storing original coordinates
      this.ox = this.attr("x");
      this.oy = this.attr("y");

      this.box.ow = this.box.attr("width");
      this.box.oh = this.box.attr("height");
    };
    var rmove = function(dx, dy) {
      // move will be called with dx and dy
      this.attr({
        x: this.ox + dx,
        y: this.oy + dy
      });
      this.box.attr({
        width: this.box.ow + dx,
        height: this.box.oh + dy
      });
      item.size.w = this.box.attr("width");
      item.size.h = this.box.attr("height");

    };
    // rstart and rmove are the resize functions;
    $(c.node).click(function(e) {
      $('#canvas-debug').children().hide();
      c.li.show();


      li.find('div.mm-clean').remove();
      // li.append('size' + JSON.stringify(c.sizer) + c.sizer.attr('x'));
      li.append('<div class="mm-clean">pos : ' + JSON.stringify(item.position) + '</div>');
      li.append('<div class="mm-clean">size : ' + JSON.stringify(item.size) + '</div>');


      e.preventDefault();
      return false;
    })
    c.drag(move, start, up);
    c.sizer = s;
    s.drag(rmove, rstart);
    s.box = c;
    return c;
  };


  Map.prototype.svgInit = function(containerID) {

    var that = this;
    this.R = Raphael(containerID, this.realWorldSize.w, this.realWorldSize.h);
    $(this.R.canvas).click(function(e) {
      $('#canvas-debug').children().hide();
      e.preventDefault();
      return false;
    });
    this.svgLoad();
  };


  Map.prototype.svgLoad = function() {
    this.svgDraw();
  };

  Map.prototype.svgDraw = function() {
    this.svgDrawBackground();
    for (var i in this.MapItems) {
      var item = this.MapItems[i];
      this.svgRaphaelAddItem(item);
    }

  };



  Map.prototype.svgDrawBackground = function() {
    if (!KLib.isUndefined(this.bgImg)) {
      $(this.bgImg.node).remove();
    }
    if (this.mapBackgroundName !== '') {
      var bg = this.itemsByName[this.mapBackgroundName];
      if (!KLib.isUndefined(bg)) {

        this.bgImg = this.R.rect(0, 0, this.realWorldSize.w, this.realWorldSize.h);
        this.bgImg.attr({
          "fill": "url('" + bg.path + "')"
        });
      }
    }
  };
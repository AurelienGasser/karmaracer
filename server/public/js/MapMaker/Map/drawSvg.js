  function createSVGElement(name) {
    var NS = "http://www.w3.org/2000/svg";
    var SVGObj = document.createElementNS(NS, name);
    return SVGObj;
  }


  Map.prototype.svgInit = function(containerID) {

    var that = this;
    var svgID = 'svg-map';



    //  this.svgTag = $('<svg id="' + svgID + '" xmlns="http://www.w3.org/2000/svg" version="1.1"/>');
    this.svgTag = createSVG(svgID);
    //this.svgTag.css('width', this.realWorldSize.w).css('height', this.realWorldSize.h);
    $('#' + containerID)[0].appendChild(this.svgTag);
    // this.svg = $(selector).children('svg')[0];
    //  this.ctx = this.canvas.getContext("2d");
    // this.canvas.onmousemove = this.mouseMove.bind(this);
    // this.canvas.onmousedown = this.mouseDown.bind(this);
    // this.canvas.onmouseup = this.mouseUp.bind(this);
    console.log('cID', containerID, this.svgTag);
    // this.svgG = $('<g/>');
    this.svgDefs = createSVGElement('defs');
    this.svgTag.appendChild(this.svgDefs);


    var border = createRect(0, 0, that.realWorldSize.w, that.realWorldSize.h, "transparent");
    border.setAttribute('stroke', '#000');
    that.svgTag.appendChild(border);


    this.svgG = createSVGElement('g');
    this.svgTag.appendChild(this.svgG);

    this.svgMouseMove = {
      x: 0,
      y: 0
    };



    function createSVG(id) {
      var svg = createSVGElement('svg');
      svg.setAttribute('width', that.realWorldSize.w);
      svg.setAttribute('height', that.realWorldSize.h);

      svg.setAttribute('version', "1.1");
      svg.setAttribute('baseProfile', "full");
      svg.setAttribute('xmlns', "http://www.w3.org/2000/svg");
      svg.setAttribute('xmlns:xlink', "http://www.w3.org/1999/xlink");
      svg.setAttribute('xmlns:ev', "http://www.w3.org/2001/xml-events");
      svg.id = id;
      return svg;
    }

    function createPattern(item) {
      var gScale = that.gScale;
      var SVGObj = createSVGElement('pattern');
      var w = gScale;
      var h = gScale;
      SVGObj.setAttribute('id', 'p' + item.name);
      SVGObj.setAttribute('width', w);
      SVGObj.setAttribute('height', h);
      SVGObj.setAttribute('patternUnits', 'userSpaceOnUse');

      var img = createSVGElement('image');
      img.setAttribute('x', 0);
      img.setAttribute('y', 0);
      img.setAttribute('width', w);
      img.setAttribute('height', h);
      img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', item.image.src);
      //img.setAttribute('style', 'fill:' + item.name + ';');      
      SVGObj.appendChild(img);
      return SVGObj;
    }

    for(var iName in this.itemsByName) {
      var item = this.itemsByName[iName];
      var p1 = createPattern(item);
      that.svgDefs.appendChild(p1);
    }
    var that = this;
    this.svgLoad();

    var svgTagQuery = $(this.svgTag);


    svgTagQuery.click(function(e) {
      console.log('click on tag', e.detail);
      that.deselectAllItems();
    });

    svgTagQuery.mousemove(function(e) {
      //console.log(e.pageX, e.pageY);
    });


  };


  Map.prototype.svgLoad = function() {
    this.svgDraw();
  };

  Map.prototype.svgDraw = function() {

    $(this.svgG).children().remove();

    console.log('DRAW SVG', this.MapItems, $(this.svgG));

    this.svgDrawBackground();
    for(var i in this.MapItems) {
      var item = this.MapItems[i];
      this.svgDrawItem(item);
    }

  };


  var createRect = function(x, y, w, h, fill) {

      var SVGObj = createSVGElement('rect')
      SVGObj.setAttribute('x', x);
      SVGObj.setAttribute('y', y);
      SVGObj.setAttribute('width', w);
      SVGObj.setAttribute('height', h);
      SVGObj.setAttribute('fill', fill);
      SVGObj.setAttribute('stroke', 'transparent');
      SVGObj.setAttribute('draggable', 'true');
      return SVGObj;
    }

  Map.prototype.svgDrawItem = function(item) {

    var that = this;
    console.log('draw item', item);
    //var isItemSelected = _.include(this.selectedItems, item.id);
    if(item.patternType !== "none") {
      var rect = createRect(item.position.x, item.position.y, item.size.w, item.size.h, "url('" + '#p' + item.name + "')");
      var size = 32;
      rect.rectSelected = createRect(item.position.x + item.size.w - size, item.position.y + item.size.h - size, size, size, '#000');
      rect.isSelected = false;
      var rectSelectedjQuery = $(rect.rectSelected);
      rectSelectedjQuery.hide();
      this.svgG.appendChild(rect);
      this.svgG.appendChild(rect.rectSelected);


      var rectQuery = $(rect);

      // allow drag and over each other > not working
      rectQuery.css('z-index', item.id);
      rectQuery.css('position', 'absolute');
      rectSelectedjQuery.css('z-index', item.id);
      rectSelectedjQuery.css('position', 'absolute');

      rectQuery.click(function(e) {
        console.log('hi', item, e.detail);
        that.selectItem(item.id, rect);
        e.preventDefault();
        return false;
      });


      rectQuery.bind('dragstart', function(e) {

        if (!rect.isSelected){
          return false;
        }
        console.log('start move');
        that.svgMouseMove = {
          x: e.pageX,
          y: e.pageY
        };

      });

      rectQuery.bind('dragend', function(e) {
        e.preventDefault();
        return false;
      });

      rectQuery.bind('dragover', function(e) {

        if (!rect.isSelected){
          return false;
        }

        var mX = that.svgMouseMove.x - e.pageX;
        var mY = that.svgMouseMove.y - e.pageY;
        var x = rectQuery.attr('x') - mX;
        var y = rectQuery.attr('y') - mY;

        var xS = rectSelectedjQuery.attr('x') - mX;
        var yS = rectSelectedjQuery.attr('y') - mY;

        that.svgMouseMove = {
          x: e.pageX,
          y: e.pageY
        };

        item.position.x = x;
        item.position.y = y;

        rectQuery.attr({'x' : x, 'y' : y});
        rectSelectedjQuery.attr({'x' : xS, 'y' : yS});
      });


    } else {
      //this.svgPaper.image(item.image.src, item.position.x, item.position.y, item.size.w, item.size.h);
    }

  }


  Map.prototype.svgDrawBackground = function() {
    if(this.mapBackgroundName !== '') {
      var bg = this.itemsByName[this.mapBackgroundName];
      if(!_.isUndefined(bg)) {
        $(this.svgTag).css('background', 'url("' + bg.path + '")');
      }
    }
  };
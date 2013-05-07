Map.prototype.saveMap = function() {

  var that = this;
  var iWidth = this.realWorldSize.w;
  var iHeight = this.realWorldSize.h;

  // this.canvas.toDataURL("image/png");
  var map = {
    "name": $('#map-name').val(),
    "enable": that.enable,
    "size": {
      "w": parseInt(iWidth / this.gScale, 10),
      "h": iHeight / this.gScale
    }
  };

  var path = '/sprites/bg_grass1.png';
  var itemBG = this.itemsByName[this.mapBackgroundName];
  if (!KLib.isUndefined(itemBG)) {
    path = itemBG.path;
  }

  if (!KLib.isUndefined(path)) {
    map['background'] = {
      'path': path,
      'name': this.mapBackgroundName
    };
  }
  map.staticItems = [];
  $.each(this.MapItems, function(id, item) {
    var jsonItem = {};
    jsonItem.name = item.name;
    jsonItem.position = {
      x: (item.position.x + item.size.w / 2) / that.gScale,
      y: (item.position.y + item.size.h / 2) / that.gScale
    };
    jsonItem.size = {
      w: parseInt(item.size.w / that.gScale),
      h: parseInt(item.size.h / that.gScale)
    };
    map.staticItems.push(jsonItem);
  });
  var mapString = JSON.stringify(map);

  // var $c = $('<canvas id="canvasSave"></canvas>');
  // $('body').append($c)
  // var svg = this.$map.html().replace(/>\s+/g, ">").replace(/\s+</g, "<");
  // canvg('canvasSave', svg, {
  //   renderCallback: function() {
  //     var img = $c[0].toDataURL("image/png");

  //     var img = Canvas2Image.saveAsPNG($c[0], true);
  //     $("body").append(img);

  //   },
  //   ignoreMouse: true,
  //   ignoreAnimation: true
  // });


  this.connection.emit('saveMap', map);
}
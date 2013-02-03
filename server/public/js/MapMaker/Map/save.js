Map.prototype.saveMap = function() {



  var that = this;
  var iWidth = this.realWorldSize.w;
  var iHeight = this.realWorldSize.h;

  // this.canvas.toDataURL("image/png");

  var map = {
    "name": $('#map-name').val(),
    "size": {
      "w": parseInt(iWidth / this.gScale, 10),
      "h": iHeight / this.gScale
    }
  };
  var path = this.itemsByName[this.mapBackgroundName].path;
  console.log(this.itemsByName[this.mapBackgroundName]);
  if(!_.isUndefined(path)) {
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
      x: parseInt((item.position.x + item.size.w / 2) / that.gScale),
      y: parseInt((item.position.y + item.size.h / 2) / that.gScale)
    };
    jsonItem.size = {
      w: parseInt(item.size.w / that.gScale),
      h: parseInt(item.size.h / that.gScale)
    };
    console.log(jsonItem);
    map.staticItems.push(jsonItem);
  });
  var mapString = JSON.stringify(map);

  this.connection.emit('saveMap', map);

  console.log(map, mapString);
}
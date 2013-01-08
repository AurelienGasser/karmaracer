Map.prototype.saveMap = function() {

  var iWidth = this.realWorldSize.w;
  var iHeight = this.realWorldSize.h;

  this.canvas.toDataURL("image/png");

  var map = {
    "name": $('#map-name').val(),
    //"backgroundImage": "/sprites/bg_grass1.png",
    "size": {
      "w": 1024,
      "h": 1024
    }
  };
  map.staticItems = [];

  $.each(this.MapItems, function(id, item) {
    var jsonItem = {};
    jsonItem.name = item.name;
    jsonItem.position = item.position;
    jsonItem.size = item.size;
    map.staticItems.push(jsonItem);
  });
    var mapString = JSON.stringify(map);

  console.log(map, mapString);
}
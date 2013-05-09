(function() {
  "use strict";

  function addProperties(map) {

    setNameEvents(map);
    setBackgroundItemsEvents(map);
    setSizeEvents(map);
  }

  function setNameEvents(map) {
    var inputName = $('#map-name');
    inputName.keyup(function() {
      map.mapName = inputName.val();
      map.loadMap(map.mapName);
    });
    inputName.val(map.mapName);
  }


  function setSizeEvents(map) {
    var widthDOM = $('#map-width');
    var heightDOM = $('#map-height');

    function updateSizeFromDOM() {
      var w = parseInt(widthDOM.val(), 10) * map.gScale;
      var h = parseInt(heightDOM.val(), 10) * map.gScale;
      map.realWorldSize.w = w;
      map.realWorldSize.h = h;
      map.resize();
    }

    widthDOM.change(updateSizeFromDOM);
    heightDOM.change(updateSizeFromDOM);
  }


  function setBackgroundItemsEvents(map) {
    var inputName = $('#map-bg');

    var o = [];
    o.push('<datalist id="bg-list">');
    for (var i = 0; i < map.backgroundItems.length; i++) {
      var bg = map.backgroundItems[i];
      o.push('<option value="', bg.name, '">');
      o.push(bg.name, '</option>');
    }
    o.push('</datalist>');

    inputName.after(o.join(''));
    inputName.keyup(function() {
      map.mapBackgroundName = inputName.val();
      map.svgDrawBackground();
    });
    inputName.val(map.mapBackgroundName);
  }


  function start() {

    var mapID = "map-canvas";

    var map = new Karma.Map('#' + mapID);
    //var items = ['wall', 'stone', 'grass', 'grass3', 'stone_l', 'stone_r', 'stone_t', 'stone_b', 'tree1'];
    map.connection.emit('get_items', function(err, itemsByName) {
      var items = [];
      for (var itemName in itemsByName) {
        items.push(itemsByName[itemName]);
      }
      map.loadItems(items, function() {
        map.loadMap(map.mapName, function() {
          addProperties(map);
          //map.startTick();
          map.svgInit(mapID);
        });
      });
    });

    $("#save-map-node").click(function() {
      map.saveMap();
    });
  }

  $(function() {
    start();
  });

}());
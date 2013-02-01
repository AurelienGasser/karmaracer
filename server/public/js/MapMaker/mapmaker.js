function addProperties(map) {
  var properties = $('#properties');
  addName(map, properties);
  addBackgroundItems(map, properties);
}

function addName(map, container) {
  var inputName = $('<input id="map-name" placeholder="map name"/>');
  container.children().first().before(inputName);
  inputName.wrap('<li/>');
  inputName.keyup(function() {
    map.mapName = inputName.val();
  });
  inputName.val(map.mapName);
}

function addBackgroundItems(map, container) {
  var inputName = $('<input id="map-bg" placeholder="background" list="bg-list"/>');

  var o = [];
  o.push('<datalist id="bg-list">');
  //console.log(map.backgroundItems);
  for(var i = 0; i < map.backgroundItems.length; i++) {
    var bg = map.backgroundItems[i];
    o.push('<option value="', bg.name, '">');
    //o.push(bg.name, '</option>');
  };
  o.push('</datalist>');

  container.children().first().before(inputName);
  inputName.wrap('<li/>');
  inputName.after(o.join(''));
  inputName.keyup(function() {
    map.mapBackgroundName = inputName.val();
  });
  inputName.val(map.mapBackgroundName);
}


function start() {

  var map = new Map("#map-canvas");

  var items = ['wall', 'stone', 'grass', 'stone_l', 'stone_r', 'stone_t', 'stone_b', 'tree1'];
  map.loadItems(items, function(err) {
    addProperties(map);
    map.startTick();
  });

  $("#save-canvas").click(function() {
    var img = Canvas2Image.saveAsPNG(map.canvas, true);
    $("body").append(img);
  });

  $("#save-map-node").click(function() {
    map.saveMap();
  });
}

$(function() {

  start();

});
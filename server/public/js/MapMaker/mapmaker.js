var G_map;

$(function(){

  G_map = new Map("#map-canvas");
 
  //console.log('map loaded');
  G_map.addItem('wall');
  G_map.addItem('stone');
  G_map.addItem('grass');
  G_map.addItem('stone_l');
  G_map.addItem('stone_r');
  G_map.addItem('stone_t');
  G_map.addItem('stone_b');
  G_map.addItem('tree1');

  $("#save-canvas").click(function(){
    // G_map.realWorldSize.w, G_map.realWorldSize.h
    var img = Canvas2Image.saveAsPNG(G_map.canvas, true);
    $("body").append(img);
  });

  var o = [];
  o.push('<input id="map-name" placeholder="map name"/>');

  $('body').append(o.join(''));

  $("#save-map-node").click(function(){
    G_map.saveMap();
    console.log(G_map.MapItems);
    //var img = Canvas2Image.saveAsPNG(G_map.canvas, true, G_map.realWorldSize.w, G_map.realWorldSize.h);
    //$("body").append(img);
  });
});
$(function(){

  var map;

  map = new Map("#map-canvas");

  //console.log('map loaded');
  map.addItem('wall');
  map.addItem('stone');
  map.addItem('grass');
  map.addItem('stone_l');
  map.addItem('stone_r');
  map.addItem('stone_t');
  map.addItem('stone_b');
  map.addItem('tree1');

  $("#save-canvas").click(function(){
    // map.realWorldSize.w, map.realWorldSize.h
    var img = Canvas2Image.saveAsPNG(map.canvas, true);
    $("body").append(img);
  });

  $("#save-map-node").click(function(){
    map.saveMap();
    //console.log(map.MapItems);
    //var img = Canvas2Image.saveAsPNG(map.canvas, true, map.realWorldSize.w, map.realWorldSize.h);
    //$("body").append(img);
  });
});
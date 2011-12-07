function Map(selector){
  this.canvas = $(selector)[0];

  this.ctx = this.canvas.getContext("2d");
  this.MapItems = {};
  this.selectedItems = [];

  this.canvasMousePosition = {"x" : 0, "y" : 0};
  this.mouseDownPosition = {"x" : 0, "y" : 0};
  this.canvas.onmousemove = this.mouseMove.bind(this);
  this.canvas.onmousedown = this.mouseDown.bind(this);
  this.canvas.onmouseup = this.mouseUp.bind(this);

  this.keyPress = {
    shift: false
  };

  this.selectedZone = {"x" : 0, "y" : 0, "w" : 0, "h" : 0};
  this.keyboardHandler = new KeyboardHandlerMap(this);

  this.scale = 1;
  this.translate = {"x" : 0, "y" : 0};
  this.realWorldSize = {"w" : 800, "h" : 500};
  this.mapName = "map69";

  this.zoomBox = null;

  var now = new Date();
  this.tickStart = now.getTime();
  this.tickCount = 0;
  this.tick();

}



Map.prototype.canvasDraw = function() {
  this.ctx.canvas.width = $(this.canvas).width();
  this.ctx.canvas.height = $(this.canvas).height();

  this.ctx.translate(this.translate.x, this.translate.y);
  this.ctx.scale(this.scale, this.scale);

  this.ctx.fillStyle = '00f';
  this.ctx.strokeRect(0, 0, this.realWorldSize.w, this.realWorldSize.h);

  for (var i in this.MapItems){
    var item = this.MapItems[i];
    this.drawItem(item);
  }

  // draw selected Zone
  if (this.action == 'selectZone') {
    this.drawSelectedZone();
  }

  if (this.zoomBox != null) {
    this.scale = this.realWorldSize.w * this.scale / this.zoomBox.w;
    this.translate.x = -this.zoomBox.x * this.scale;
    this.translate.y = -this.zoomBox.y * this.scale;
    this.zoomBox = null;
  }
};


Map.prototype.tick = function() {
  this.tickCount++;

  var debugoutput = [];
  var now = new Date();
  
  var tickDiff = now.getTime() - this.tickStart;
  //console.log(tickDiff);
  if (tickDiff > 1000){
    $('#fps').html('fps:' + this.tickCount);
    this.tickCount = 0;
    this.tickStart = now.getTime();
  }

  

  requestAnimFrame(this.tick.bind(this));
  this.canvasDraw();

 
  debugoutput.push('<li>Canvas Mouse Pos : ', this.canvasMousePosition.x, ', ', this.canvasMousePosition.y ,'</li>');
  debugoutput.push('<li>Canvas Down Pos : ', this.mouseDownPosition.x, ', ', this.mouseDownPosition.y ,'</li>');

  debugoutput.push('<li>Action : ', this.action ,'</li>');
  debugoutput.push('<li>ScaleCanvas : ', this.scale ,'</li>');
  debugoutput.push('<li>TranslateCanvas : ', this.translate.x, ', ', this.translate.y ,'</li>');

  debugoutput.push('<li>--------</li>');
  debugoutput.push('<li>Help</li>');
  debugoutput.push('<li>Arrows (move canvas)</li>');
  debugoutput.push('<li>R (release items)</li>');
  debugoutput.push('<li>P/L (zoom/unzoom)</li>');
  debugoutput.push('<li>S (set scale to 1)</li>');
  debugoutput.push('<li>Z (zoom to selected items)</li>');

  $("#canvas-debug").html(debugoutput.join(''));
  if (this.action == 'translate'){
    this.translateSelectedItemsUsingMousePosition();
  }
 
};

Map.prototype.addItem = function(itemName) {
  var items = $('#items');
  $.getJSON('/items/' + itemName + '.json', function(item){
    //console.log(item);
    var itemID = 'item-' + item.name;
    items.append('<li class="item" id="' + itemID + '">' + item.name+  '</li>');
    $('#' + itemID).click(function(){
        var now = new Date();
        var timestamp = now.getTime();                
        this.MapItems[timestamp] = new MapItem(item, this.ctx, timestamp);
    }.bind(this));
  }.bind(this))
};





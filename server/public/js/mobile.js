//document.body.addEventListener('touchmove', function(e){ e.preventDefault(); });

$(function(){

  document.ontouchmove = function(e){ e.preventDefault();}
  $('#pad-top').bind('touchmove', function(){
    nodeserver.emit('accelerate', +5.0);
    //$('body').append('top');
    //this.css('background-color', 'red');
  });

  
  $('#pad-bottom').bind('touchmove', function(){
    //$('body').append('bottom');
    nodeserver.emit('accelerate', -5.0);
  });

  $('#pad-left').bind('touchmove', function(){
    nodeserver.emit('turnCar', +0.5);
    //$('body').append('left');
    //this.css('background-color', 'red');
  });
  $('#pad-right').bind('touchmove', function(){
    nodeserver.emit('turnCar', -0.5);
    //$('body').append('right');
    //this.css('background-color', 'red');
  });  
  
  $('#game-canvas').width($('.ui-mobile-viewport').width()); 
  $('#game-canvas').height($('.ui-mobile-viewport').height());


});
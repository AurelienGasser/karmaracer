$(function(){
  if (isMobile()){
    G_MOBILE_DEVICE = true;
  }

  G_game = new Game();
  if (G_MOBILE_DEVICE == true){
    handleKeysMobile();
  }
});


function isMobile(){
 if( navigator.userAgent.match(/Android/i) ||
 navigator.userAgent.match(/webOS/i) ||
 navigator.userAgent.match(/iPhone/i) ||
 navigator.userAgent.match(/iPod/i)
 ){
  return true;
  }
}
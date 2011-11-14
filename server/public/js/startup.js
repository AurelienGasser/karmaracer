$(function(){
  game = new Game();
  game.SocketManager = new SocketManager(karmaracer_server, onSocketLoad, game);
  handleKeysMobile();
});
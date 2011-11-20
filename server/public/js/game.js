function Game(){
  this.cars = [];
  this.mycar;
  this.walls = [];
  this.drawEngine;
  this.socketManager = new SocketManager(G_serverHost, this, this.onInitReceived);
}

Game.prototype.onInitReceived = function(err, worldInfo) {
  // once socket init has been done
  G_game.world = {};
  G_game.world.size = worldInfo.size;
  G_game.walls = worldInfo.walls;
  G_game.drawEngine = DrawEngineFactory(G_game, "game-canvas", G_defaultDrawEngineType);
  G_game.keyboardHandler = new KeyboardHandler();
  document.onkeydown = G_game.keyboardHandler.handleKeyDown.bind(G_game.keyboardHandler);
  document.onkeyup = G_game.keyboardHandler.handleKeyUp.bind(G_game.keyboardHandler);
  G_game.drawEngine.tick();
};


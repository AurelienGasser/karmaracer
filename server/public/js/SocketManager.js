function SocketManager(serverHost, game, onInitCallback){
  var connection = io.connect(serverHost);
  this.game = game;
  this.init_done = false;

  connection.on('connect', function (data) {
  });

  connection.on('init', function (worldInfo) {
    onInitCallback(null, worldInfo);
    connection.emit('init_done');
    this.init_done = true;
  });

  connection.on('chat_msg', function (msg) {
    $('#chat_msgs').append('<li>' + msg + '</li>');
  });

  connection.on('objects', function (objects) {
    game.cars = objects.cars;
    game.mycar = objects.myCar;
    game.walls = objects.walls;
  });

  this.connection = connection;
}

SocketManager.prototype.getConnection = function() {
  return this.connection;
};

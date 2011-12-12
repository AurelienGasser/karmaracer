function SocketManager(serverHost, gameInstance, onInitCallback){
  var connection = io.connect(serverHost);
  //console.log(connection);
  this.gameInstance = gameInstance;
  this.init_done = false;

  connection.on('connect', function (data) {
    //console.log('client connected');
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
    gameInstance.cars = objects.cars;
    gameInstance.mycar = objects.myCar;
  });

  this.connection = connection;
}

SocketManager.prototype.getConnection = function() {
  return this.connection;
};

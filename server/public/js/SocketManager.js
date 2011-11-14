function SocketManager(server, init_function, game){
  var nodeserver = io.connect(server);
  this.game = game;
  this.init_done = false;

  nodeserver.on('connect', function (data) {
  });

  nodeserver.on('init', function (data) {
    init_function(data);
    nodeserver.emit('init_done');
    this.init_done = true;
  });


  nodeserver.on('chat_msg', function (msg) {
    $('#chat_msgs').append('<li>' + msg + '</li>');
  });

  nodeserver.on('objects', function (objects) {
    game.cars = objects.cars;
    game.mycar = objects.myCar;
    game.walls = objects.walls;
  }); 

  this.nodeserver = nodeserver;
}


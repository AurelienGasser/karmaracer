function SocketManager(serverHost, gameInstance, onInitCallback){
  var connection = io.connect(serverHost);
  //console.log(connection);
  this.gameInstance = gameInstance;
  this.init_done = false;
  this.socketCounter = 0;
  this.timestamp = new Date().getTime();
  this.msg_id = 0;


  var that = this;

  function socketReceived(){
    var now = new Date().getTime();
    //
    if (now - that.timestamp > 1000){
      //console.log(that.socketCounter);
      that.timestamp = now;
      $('#socketps').html('socket/ps: ' + that.socketCounter);
      that.socketCounter = 0;
    }
    that.socketCounter += 1;
  }

  $('#debug').append('<div id="socketps" class="info"></div>');
  $('#debug').append('<div id="debug-sockets" class="info">sockets</div>');

  connection.on('connect', function (data) {
    //console.log('client connected');
  });

  connection.on('init', function (worldInfo) {
    onInitCallback(null, worldInfo);
    connection.emit('init_done');
    this.init_done = true;
  });

  connection.on('chat_msg', function (msg) {
    var key = 'msg_' + that.msg_id;
    onChatMsgReceived(msg, key);
    ++that.msg_id;
  });

  connection.on('objects', function (objects) {
    gameInstance.cars = objects.cars;
    gameInstance.mycar = objects.myCar;
    gameInstance.bullets = objects.bullets;
    //console.log(ga.bullets);
    $('#debug-sockets').html(JSON.stringify(_.map(objects, function(list){
      return list.length;
    })));
    socketReceived();
  });

  this.connection = connection;
}

SocketManager.prototype.getConnection = function() {
  return this.connection;
};

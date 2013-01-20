var connection;

function SocketManager(serverHost, gameInstance, onInitCallback){
  connection = io.connect(serverHost);
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
    if (!localStorage.username || localStorage.username.length == 0) {
      localStorage.username = prompt('Welcome to Karmaracer !\nWhat\'s your name ?')
    }
    $('#player_name').val(localStorage.username);
    connection.emit('init_done', { playerName: localStorage.username });
    this.init_done = true;
  });

  connection.on('chat_msg', function (msg) {
    var key = 'msg_' + that.msg_id;
    onChatMsgReceived(msg, key);
    ++that.msg_id;
  });

  connection.on('scores', function (scores) {
    // console.log(scores);
    var o = [];
    for (var i = 0; i < scores.length; i++) {
      var s = scores[i];
      o.push('<li>', s.name, ':', s.score, '</li>');
    };
    $('#scores').html(o.join(''));
  });

  connection.on('dead', function () {
    var div = $('<div id="urdead" style="font-size: 72px; color: red; text-align: center; width: 100%; height: 200px; z-index: 9999; position: absolute; left: 100px; top: 100px">You\'re dead !</div>')
    div.appendTo($('body'));
    setTimeout(function() {
      $('#urdead').fadeOut(function() {
        $('#urdead').remove();
      });
    }, 4000)
  });


  connection.on('objects', function (objects) {
    gameInstance.cars = objects.cars;
    gameInstance.mycar = objects.myCar;
    gameInstance.bullets = objects.bullets;
    $('#debug-sockets').html(JSON.stringify(_.map(objects, function(list){
      return list ? list.length : 0;
    })));
    socketReceived();
  });

  connection.on('explosion', function (explosion) {
    gameInstance.addExplosion(explosion);
  });

  this.connection = connection;
}

SocketManager.prototype.getConnection = function() {
  return this.connection;
};

SocketManager.prototype.emit = function(key, data){
  this.connection.emit(key, data);
}

$(function() {
  $('#addBot').click(function() {
    connection.emit('add bot');
  })
})

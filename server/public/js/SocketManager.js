$(window).on('beforeunload', function() {
  connection.emit('disconnect');
});

var connection;

function SocketManager(gameInstance, onInitCallback) {
  var host = window.location.hostname;
  connection = io.connect(host);

  this.gameInstance = gameInstance;
  this.init_done = false;
  this.socketCounter = 0;
  this.timestamp = new Date().getTime();
  this.msg_id = 0;
  this.gameInstance.bodies = [];

  var that = this;

  function socketReceived() {
    var now = new Date().getTime();
    //
    if(now - that.timestamp > 1000) {
      //console.log(that.socketCounter);
      that.timestamp = now;
      $('#socketps').html('socket/ps: ' + that.socketCounter);
      that.socketCounter = 0;
    }
    that.socketCounter += 1;
  }

  $('#debug').append('<div id="socketps" class="info"></div>');
  $('#debug').append('<div id="debug-sockets" class="info">sockets</div>');

  connection.on('connect', function(data) {
    console.log('client connected', G_mapName);
    if(!_.isUndefined(G_mapName)) {
      connection.emit('enter_map', G_mapName);
    }

  });

  connection.on('init', function(worldInfo) {
    onInitCallback(null, worldInfo);
    console.log('worldInfo', worldInfo);
    if(!Karma.get('playerName') || Karma.get('playerName').length === 0) {
      Karma.set('playerName', prompt('Welcome to Karmaracer !\nWhat\'s your name ?'));
    }
    $('#player_name').val(Karma.get('playerName'));
    connection.emit('init_done', {
      playerName: Karma.get('playerName')
    });
    this.init_done = true;
  });

  connection.on('chat_msg', function(msg) {
    var key = 'msg_' + that.msg_id;
    onChatMsgReceived(msg, key);
    ++that.msg_id;
  });

  // connection.on('scores', function(scores) {
  // });

  function announce(text, color) {
    $('#announce').remove();
    var div = $('<div id="announce" class="announce-' + color + '">' + text + '</div>')
    div.appendTo($('body'));
    setTimeout(function() {
      $('#announce').fadeOut(function() {
        $('#announce').remove();
      });
    }, 4000);
  }

  connection.on('dead', function() {
    announce('You\' re dead !', 'red');
  });

  function announceIn(msg, color, timeInSeconds) {
    setTimeout(function() {
      announce(msg, color);
    }, timeInSeconds * 1000);

  }

  connection.on('game end', function(d) {
    announce(d.winnerName + ' wins the game !!!!', 'blue');

    announceIn('2', 'red', 3);
    announceIn('1', 'orange', 4);
    announceIn('GO', 'green', 5);

  })

  connection.on('objects', function(objects) {
    // console.log(objects);
    gameInstance.cars = objects.cars;
    gameInstance.mycar = objects.myCar;
    // gameInstance.bullets = objects.projectiles.bullets;
    // gameInstance.rockets = objects.projectiles.rockets;
    gameInstance.projectiles = objects.projectiles;
    // gameInstance.bodies = objects.bodies;
    gameInstance.updateScoresHTML();
    $('#debug-sockets').html(JSON.stringify(_.map(objects, function(list) {
      return list ? list.length : 0;
    })));
    socketReceived();
  });

  connection.on('explosion', function(explosion) {
    gameInstance.addExplosion(explosion);
  });

  this.connection = connection;
}

SocketManager.prototype.getConnection = function() {
  return this.connection;
};

SocketManager.prototype.emit = function(key, data) {
  this.connection.emit(key, data);
}

$(function() {
  $('#addBot').click(function() {
    connection.emit('add bot');
  })
  $('#removeBot').click(function() {
    connection.emit('remove bot');
  })
})
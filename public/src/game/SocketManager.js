/*global prompt,io, G_mapName*/
(function(io) {
  "use strict";

  function SocketManager(gameInstance, onInitCallback) {
    var host = window.location.hostname;
    this.connection = io.connect(host);
    this.gameInstance = gameInstance;
    this.init_done = false;
    this.socketCounter = 0;
    this.timestamp = new Date().getTime();
    this.msg_id = 0;
    this.gameInstance.bodies = [];

    var that = this;

    $(window).on('beforeunload', function() {
      that.connection.emit('disconnect');
    });

    $(function() {
      $('#addBot').click(function() {
        that.connection.emit('add bot');
      });
      $('#removeBot').click(function() {
        that.connection.emit('remove bot');
      });
    });

    function socketReceived() {
      var now = new Date().getTime();
      if (now - that.timestamp > 1000) {
        that.timestamp = now;
        $('#socketps').html('socket/ps: ' + that.socketCounter);
        that.socketCounter = 0;
      }
      that.socketCounter += 1;
    }

    $('#debug').append('<div id="socketps" class="info"></div>');
    $('#debug').append('<div id="debug-sockets" class="info">sockets</div>');

    that.connection.on('connect', function() {
      if (!_.isUndefined(G_mapName)) {
        that.connection.emit('enter_map', G_mapName);
        announce('Shoot them all !', 'blue');
      } else {}

    });

    this.connection.on('init', function(worldInfo) {
      onInitCallback(null, worldInfo);
      if (!Karma.LocalStorage.get('playerName') || Karma.LocalStorage.get('playerName').length === 0) {
        Karma.LocalStorage.set('playerName', prompt('Welcome to Karmaracer !\nWhat\'s your name ?'));
      }
      that.connection.emit('init_done', {
        playerName: Karma.LocalStorage.get('playerName')
      });
      this.init_done = true;
    });

    this.connection.on('chat_msg', function(msg) {
      var key = 'msg_' + that.msg_id;
      Karma.Chat.onChatMsgReceived(msg, key);
      ++that.msg_id;
    });

    function announce(text, color, extraClass) {
      if (KLib.isUndefined(extraClass)) {
        extraClass = '';
      }
      $('#announce').remove();
      var div = $('<div id="announce" class=" ' + extraClass + ' announce-' + color + '"><span>' + text + '</span></div>');
      // div.hide();
      div.appendTo($('body'));

      // div.fadeIn(function() {
      setTimeout(function() {
        $('#announce').fadeOut(function() {
          $('#announce').remove();
        });
      }, 4000);
      // });

    }

    this.connection.on('dead', function() {
      announce('You\' re dead !', 'red');
    });

    function announceIn(msg, color, timeInSeconds, extraClass, callback) {
      setTimeout(function() {
        announce(msg, color, extraClass);
        if (KLib.isFunction(callback)) {
          return callback(null);
        }
      }, timeInSeconds * 1000);

    }

    this.connection.on('game end', function(d) {

      $('table.scores').addClass('big').removeClass('default');

      var removeBigScore = function() {
        $('table.scores').removeClass('big').addClass('default');
      };

      announce(d.winnerName + ' wins the game !!!!', 'black', 'freeze');
      announceIn('2', 'red', 3, 'freeze');
      announceIn('1', 'orange', 4, 'freeze', removeBigScore);
      announceIn('GO', 'green', 5, '');

    });


    that.connection.on('objects', function(objects) {
      gameInstance.items.cars = objects.cars;
      gameInstance.items.mycar = objects.myCar;
      gameInstance.items.projectiles = objects.projectiles;
      gameInstance.items.collisionPoints = objects.collisionPoints;
      gameInstance.updateScoresHTML();
      //for minimap
      gameInstance.mycarPosition.x = objects.myCar.x;
      gameInstance.mycarPosition.y = objects.myCar.y;

      gameInstance.drawEngine.gScaleDynamicsRequired = true;
      $('#debug-sockets').html(JSON.stringify(_.map(objects, function(list) {
        return list ? list.length : 0;
      })));
      socketReceived();

    });

    that.connection.on('explosion', function(explosion) {
      gameInstance.addExplosion(explosion);
    });

  }

  SocketManager.prototype.getConnection = function() {
    return this.connection;
  };

  SocketManager.prototype.emit = function(key, data) {
    this.connection.emit(key, data);
  };


  Karma.SocketManager = SocketManager;
}(io));
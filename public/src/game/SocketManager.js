/*global prompt,io, G_mapName, G_fbid*/
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


    function setupBotMenu() {
      var $botmenu = $('#botMenu');
      var $addBot = $('<input id="#addBot" type="button" value="' + $.i18n.prop('bots_add') + '"/>');
      var $removeBot = $('<input id="#removeBot" type="button" value="' + $.i18n.prop('bots_remove') + '"/>');

      $botmenu.append($addBot);
      $botmenu.append($removeBot);
      $addBot.click(function() {
        that.connection.emit('add bot');
      });
      $removeBot.click(function() {
        that.connection.emit('remove bot');
      });
    }

    setupBotMenu();

    function socketReceived() {
      var now = new Date().getTime();
      if (now - that.timestamp > 1000) {
        that.timestamp = now;
        that.$socketps.html('socket/ps: ' + that.socketCounter);
        that.socketCounter = 0;
      }
      that.socketCounter += 1;
    }


    var $debug = $('#debug');
    $debug.append('<div id="debug-sockets" class="info">sockets</div>');
    this.$socketps = $('<div id="socketps" class="info"></div>');
    $debug.append(this.$socketps);

    this.gv = new Karma.GunViewer($('body'), that.connection);

    that.connection.on('connect', function() {
      if (!_.isUndefined(G_mapName)) {
        that.connection.emit('enter_map', G_mapName);
        announce($.i18n.prop('game_startmessage') + '</br>' + Karma.TopBar.getHelps(), 'blue');
      }
      setInterval(that.ping.bind(that), 1000);
      that.ping();
    });

    this.connection.on('init', function(initInfo) {
      var worldInfo = initInfo.worldInfo;
      var config    = initInfo.config;
      onInitCallback(null, worldInfo, config);
      if (!Karma.LocalStorage.get('playerName') || Karma.LocalStorage.get('playerName').length === 0) {
        Karma.LocalStorage.set('playerName', prompt('Welcome to Karmaracer !\nWhat\'s your name ?'));
      }
      that.connection.emit('init_done', {
        playerName: Karma.LocalStorage.get('playerName')
      });
      this.init_done = true;
    });

    this.connection.on('chat_msg', function(msg) {
      that.gameInstance.chat.onChatMsgReceived(msg);
    });

    this.connection.on('car_killed', function(data) {
      var msg = $.i18n.prop('game_take_soul_broadcast', data.attacker.name, data.victim.name);
      if (data.victim.fbId !== 0) {
        Karma.Facebook.takeSoul(data.victim.fbId);
      }
      that.gameInstance.pointsManager.add(data.victim);
      that.gameInstance.chat.onChatMsgReceived(msg, 'gameMessage');
    });

    function announce(text, color, extraClass) {
      if (KLib.isUndefined(extraClass)) {
        extraClass = '';
      }
      $('#announce').remove();
      var div = $('<div id="announce" class="announce ' + extraClass + ' announce-' + color + '"><span>' + text + '</span></div>');
      div.appendTo($('body'));
      setTimeout(function() {
        $('#announce').fadeOut(function() {
          $('#announce').remove();
        });
      }, 4000);
    }

    this.connection.on('moneyUpdated', function(user) {
      Karma.TopBar.setKarma(user);
    });

    this.connection.on('dead', function() {
      announce($.i18n.prop('game_playerdie'), 'red');
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
      // $('#topBar').toggleClass('init');

      var removeBigScore = function() {
        $('table.scores').removeClass('big').addClass('default');
      };

      var updateScoreInTopBar = function() {
        Karma.FB.updateScoreInTopBar(G_fbid);
      };

      var msg = $.i18n.prop('game_winsthegame', d.winnerName);
      announce(msg, 'black', 'freeze');
      announceIn('2', 'red', 3, 'freeze', updateScoreInTopBar);
      announceIn('1', 'orange', 4, 'freeze', removeBigScore);
      announceIn($.i18n.prop('game_go'), 'green', 5, '');

    });

    var counterGameInfo = 0;

    that.connection.on('gameInfo', function(gameInfo){
      gameInstance.gameInfo = gameInfo;
      gameInstance.scoreTable.updateScoresHTML(gameInfo, gameInstance.items, gameInstance.myCar);
      counterGameInfo += 1;
    });

    that.connection.on('objects', function(objects) {
      that.gameInstance.engine.bodies = {};
      for (var i in objects.snapshot.cars) {
        var car = objects.snapshot.cars[i];
        if (objects.myCar !== null &&
            car.id === objects.myCar.id) {
          // remove myCar from snapshot.cars
          delete objects.snapshot.cars[i];
        }
        if (car.dead === false) {
          // add the physical body
          car.w = 1;
          car.h = 0.5;
          that.gameInstance.engine.createBody(car, car, 'car');
        }
      }

      gameInstance.snapshots[objects.snapshot.stepNum] = objects.snapshot;
      gameInstance.myCar = objects.myCar;
      gameInstance.items.projectiles = objects.projectiles;
      gameInstance.items.collisionPoints = objects.collisionPoints;

      //for minimap
      if (objects.myCar !== null) {
        var player = gameInstance.gameInfo[objects.myCar.id];
        that.gv.updateEnergy(player.weaponName, objects.myCar.gunLife);
      }

      $('#debug-sockets').html(JSON.stringify(_.map(objects, function(list) {
        return list ? list.length : 0;
      }).concat([counterGameInfo])));
      socketReceived();
    });

    that.connection.on('explosion', function(explosion) {
      gameInstance.explosionManager.addExplosion(explosion);
    });

  }

  SocketManager.prototype.ping = function() {
    var that = this;
    var sentTs = Date.now();
    this.connection.emit('ping', { clientSentTs: sentTs }, function(err, res) {
      if (!err) {
        res.clientSentTs     = sentTs;
        res.clientReceivedTs = Date.now();
        that.gameInstance.clock.pong(res);
      }
    });
  };

  SocketManager.prototype.getConnection = function() {
    return this.connection;
  };

  SocketManager.prototype.emit = function(key, data) {
    this.connection.emit(key, data);
  };


  Karma.SocketManager = SocketManager;
}(io));
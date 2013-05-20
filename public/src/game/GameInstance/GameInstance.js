(function() {
  /*global G_mapName*/
  "use strict";

  function GameInstance() {
    Karma.TopBar.setTopBar();
    this.scoresTable = $('tbody#scores');

    this.items = {};
    this.items.cars = [];
    this.items.explosions = {};
    this.items.mycar = null;
    this.items.projectiles = [];

    this.worldInfo = {};

    this.drawEngine = null;

    this.explosionManager = new Karma.ExplosionsManager(this);
    this.socketManager = new Karma.SocketManager(this, this.onInitReceived.bind(this));


    this.setUIEvents();
    this.isMobile = false;
    this.mycarPosition = {
      x: 0,
      y: 0
    };



    // this.loadCars();
    // this.setupSound();
    var that = this;

  }

  GameInstance.prototype.updateScoresHTML = function() {
    var that = this;

    function getScores() {
      var scores = _.map(that.items.cars, function(car) {
        return {
          'score': car.s,
          'level': car.l,
          'name': car.playerName,
          'highScore': car.highScore,
          'id': car.id
        };
      });
      scores = _.sortBy(scores, function(c) {
        return c.score;
      }).reverse();
      return scores;
    }
    var scores = getScores();
    var o = [];
    for (var i = 0; i < scores.length; i++) {
      var playerScore = scores[i];
      var userCarClass = (that.items.mycar !== null && that.items.mycar.id === playerScore.id) ? 'userCar' : '';
      o.push('<tr class="', userCarClass, '"><td>', playerScore.name, '</td><td>', playerScore.score, '</td><td>', playerScore.level, '</td><td>', playerScore.highScore, '</td></tr>');
    }
    this.scoresTable.html(o.join(''));
  };


  GameInstance.prototype.updatePlayerName = function(name) {
    this.socketManager.emit('updatePlayerName', name);
    Karma.LocalStorage.set('playerName', name);
  };

  GameInstance.prototype.setUIEvents = function() {
    var that = this;
    $('#playerName').keyup(function() {
      that.updatePlayerName($(this).val());
    });
  };



  GameInstance.prototype.onInitReceived = function(err, worldInfo) {
    var that = this;
    this.worldInfo = worldInfo;
    this.bullets = [];
    this.rockets = [];
    var defaultDrawEngineType = 'CANVAS';
    var canvasReady = function() {
      that.keyboardHandler = new Karma.KeyboardHandler(that);
      document.onkeydown = that.keyboardHandler.handleKeyDown.bind(that.keyboardHandler);
      document.onkeyup = that.keyboardHandler.handleKeyUp.bind(that.keyboardHandler);
      that.drawEngine.tick();
    };

    that.drawEngine = Karma.getDrawEngine("game-canvas", defaultDrawEngineType, that.items, that.worldInfo, canvasReady);
    // that.explosionManager.start();

    new Karma.MiniMap($('body'), G_mapName, that.socketManager.connection, that.items, that.mycarPosition);
  };


  Karma.GameInstance = GameInstance;

}());
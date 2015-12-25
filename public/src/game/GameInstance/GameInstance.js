(function() {
  /*global G_mapName*/
  "use strict";

  function GameInstance() {

    this.config = undefined; // will be defined by onInitReceived
    this.snapshots = {};
    this.items = {};
    this.myCar = null;
    this.items.cars = [];
    this.items.explosions = {};
    this.items.myCar = null;
    this.items.projectiles = [];
    this.points = {};
    this.pointsID = 0;

    this.pointsManager = new Karma.PointsManager();
    this.scoreTable = Karma.ScoreTable;
    this.scoreTable.setup();

    this.worldInfo = {};

    this.drawEngine = null;

    this.clockSync = new Karma.ClockSync();
    this.socketManager = new Karma.SocketManager(this, this.onInitReceived.bind(this));

    this.setUIEvents();
    this.isMobile = false;

    this.chat = new Karma.ChatController();
  }

  GameInstance.prototype.setUIEvents = function() {
    var that = this;
  };

  GameInstance.prototype.onInitReceived = function(err, worldInfo, config) {
    this.config = config;
    Karma.TopBar.setTopBar(this.socketManager.connection);
    var that = this;
    this.worldInfo = worldInfo;
    this.engine = new Karma.Engine(worldInfo.map.size, worldInfo.map); // physics engine
    this.bullets = [];
    this.rockets = [];
    this.gameInfo = null; // is set from sockets

    var defaultDrawEngineType = 'CANVAS';
    
    this.loadCars();    
    Karma.getDrawEngine(false, 'game-canvas', defaultDrawEngineType, that.items, that.worldInfo, 32, this, that.socketManager.connection, this.onDrawEngineReady.bind(this));

    if (that.isMobile === false) {
      new Karma.Minimap($('body'), G_mapName, that.socketManager.connection, that.items, that);
    }
  };
  
  GameInstance.prototype.onDrawEngineReady = function(err, drawEngine) {
    this.drawEngine = drawEngine;
    $('#loadingtext').html('');      
    this.userCommandManager = new Karma.UserCommandManager_client(this);
    this.keyboardHandler = new Karma.KeyboardHandler(this);
    document.onkeydown = this.keyboardHandler.handleKeyDown.bind(this.keyboardHandler);
    document.onkeyup = this.keyboardHandler.handleKeyUp.bind(this.keyboardHandler);
    this.drawEngine.tick();    
  };
  
  GameInstance.prototype.loadCars = function() {
    var that = this;

    var getCarFromDb = function(carDb) {
      carDb.image = new Image();
      carDb.image.src = carDb.path;
      return carDb;
    };

    var conn = this.socketManager.connection;

    if (!KLib.isUndefined(conn)) {
      conn.emit('getCars', function(err, cars) {
        if (err) {
          Karma.Log.error(err);
          return;
        }
        var _cars = {};
        for (var i = 0; i < cars.length; i++) {
          var car = cars[i];
          _cars[car.name] = getCarFromDb(car);
        }
        that.cars = _cars;
      });
    }
  };

  Karma.GameInstance = GameInstance;

}());
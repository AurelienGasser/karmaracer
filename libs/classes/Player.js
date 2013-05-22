var PlayerCar = require('./PlayerCar');
var Car = require('./PhysicsEngine/Car');
var KLib = require('./KLib');

var Player = function(client, playerName) {
  this.client = client;
  this.playerName = playerName;
  this.connected = true;
}

Player.prototype.initCar = function(gameServer) {
  if (KLib.isUndefined(this.playerCar)){
    this.playerCar = new PlayerCar(gameServer, this.client, this.playerName, this);
  }else{
    this.playerCar.resetPlayer();
  }
}

Player.prototype.saveVictory = function() {
  this.client.gameServer.mapManager.collectionVictories.findAndModify(
      { playerName: this.playerName }
    , []
    , { $inc: { numVictories: 1 }  }
    , { upsert: true, 'new': true }
    , function(err, res) {
      }
  );
  console.log(this.playerName, 'victory')
}

module.exports = Player;

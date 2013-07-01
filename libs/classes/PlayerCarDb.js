var KLib = require('./KLib');
var UserController = require('./../db/UserController');


module.exports = function(PlayerCar) {
  PlayerCar.prototype.loadFromSessionUser = function() {
    var that = this;
    if (that.client !== null) {
      if (!KLib.isUndefined(this.client.handshake.session) && !KLib.isUndefined(this.client.handshake.session.user)) {
        var user = this.client.handshake.session.user;
        this.user = user;
        this.car.carImageName = user.currentCar;
        this.saveUserDb();
      }
    }
  };

  PlayerCar.prototype.increaseMoney = function(value) {
    if (this.user) {
      this.user.money += value;
      UserController.save(this.user);
    }
  };


  PlayerCar.prototype.saveUserDb = function(callback) {
    if (this.user) {
      UserController.save(this.user, callback);
    }
  };


}
var KLib = require('./KLib');
var UserController = require('./../db/UserController');


module.exports = function(PlayerCar) {
  PlayerCar.prototype.loadFromSessionUser = function() {
    var that = this;
    if (that.client !== null) {
      if (!KLib.isUndefined(this.client.handshake.session) && !KLib.isUndefined(this.client.handshake.session.user)) {
        var user = this.client.handshake.session.user;
        this.userDb = user;
        this.saveUserDb();
      }
    }
  };

  PlayerCar.prototype.saveUserDb = function(callback) {
    if (this.userDd !== null) {
      var user = this.userDb;
      UserController.saveUser(user);
    }
  };


}
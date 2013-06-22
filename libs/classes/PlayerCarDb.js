var KLib = require('./KLib');
var UserController = require('./../db/UserController');


module.exports = function(PlayerCar) {
  PlayerCar.prototype.loadFromSessionUser = function() {
    var that = this;
    if (that.client !== null) {
      if (!KLib.isUndefined(this.client.handshake.session) && !KLib.isUndefined(this.client.handshake.session.user)) {
        var user = this.client.handshake.session.user;
        console.log('get user', user);
        this.userDb = user;
        this.saveUserDb();
      }
    }
  };

  PlayerCar.prototype.saveUserDb = function() {
    if (this.userDd !== null) {
      var user = this.userDb;

      console.log(this.userDb);

      //clone
      var s = JSON.stringify(user);
      if (s === null){
        return;
      }
      var updateUser = JSON.parse(s);

      if (updateUser === null){
        console.log(s);
        return;
      }

      delete updateUser._id;
      UserController.users().update({
        'fbid': user.fbid
      }, {
        $set: updateUser
      }, {
        upsert: true
      }, function(err) {
        if (err) console.warn('err save user', err.message);
        else console.log('successfully updated', updateUser);
      });
    }
  };


}
var DBManager = require('./../db/DBManager');

module.exports = function() {

  var that = {};
  DBManager.getCollection('users', function(err, users) {
    that.users = users;
  });

  var createOrGetUser = function(userFBId, playerName, callback) {
    that.users.find({
      'fbid': userFBId
    }).toArray(function(err, results) {
      if (err) {
        return callback(err);
      }
      if (results.length === 0) {
        that.users.insert({
          'fbid': userFBId,
          'victories' : 0,
          'currentCar' : 'car1',
          'highScore' : 0,
          'playerName' : playerName
        }, function(err, results) {
          if (err) {
            return callback(err);
          }
          return callback(null, results[0]);
        });
      } else {
        return callback(null, results[0]);
      }
    });
  }

  var getUsersCollection = function(){
    return that.users;
  }

  return {
    createOrGetUser : createOrGetUser,
    users : getUsersCollection
  };

}();
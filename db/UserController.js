var DBManager = require('./../db/DBManager');

module.exports = function() {


  var that = {};
  DBManager.getCollection('users', function(err, users) {
    that.users = users;
  });

  var createOrGetUser = function(userFBId, callback) {
    collection.find({
      'fbid': userFBId
    }).toArray(function(err, results) {
      if (err) {
        return callback(err);
      }
      if (results.length === 0) {
        collection.insert({
          'fbid': userFBId
        }, function(err, results) {
          if (err) {
            return callback(err);
          }
          console.log(users);
          return callback(null, results[0]);
        });
      } else {
        return callback(null, results[0]);
      }
    });
  }


}();
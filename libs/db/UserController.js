(function() {
  "use strict";

  var DBManager = require('./DBManager');
  var KLib = require('./../classes/KLib');

  module.exports = function() {

    var that = {};
    DBManager.getCollection('users', function(err, users) {
      that.users = users;
    });

    var saveUser = function(userDb, callback) {
      if (userDb && userDb !== null) {
        var user = userDb;

        //clone
        var s = JSON.stringify(user);
        if (s === null) {
          return;
        }
        var updateUser = JSON.parse(s);
        if (updateUser === null) {
          return;
        }

        delete updateUser._id;
        getUsersCollection().update({
          'fbid': user.fbid
        }, {
          $set: updateUser
        }, {
          upsert: true
        }, function(err) {
          if (err) {
            console.warn('err save user', err.message);
            if (KLib.isFunction(callback)) {
              return callback(err);
            }
          } else {
            if (KLib.isFunction(callback)) {
              return callback(null);
            }
          }
        });
      }
    };

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
            'victories': 0,
            'currentCar': 'car1',
            'highScore': 0,
            'playerName': playerName
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
    };

    var getUsersCollection = function() {
      return that.users;
    };

    return {
      createOrGetUser: createOrGetUser,
      users: getUsersCollection,
      saveUser: saveUser
    };

  }();

}());
(function() {
  "use strict";

  var DBManager = require('./DBManager');
  var KLib = require('./../classes/KLib');

  module.exports = function() {

    var that = {};
    DBManager.getCollection('users', function(err, collection) {
      that.collection = collection;
    });

    var save = function(item, callback) {
      return DBManager.saveItem(getCollection(), {
        'fbid': item.fbid
      }, item, callback);
    };

    var getInitValue = function(userFBId, playerName) {
      return {
        'fbid': userFBId,
        'victories': 0,
        'currentCar': 'c1',
        'highScore': 0,
        'playerName': playerName,
        'cars' : ['c1']
      };
    };

    var createOrGet = function(userFBId, playerName, callback) {
      return DBManager.createOrGetItem(that.collection, {
        'fbid': userFBId
      }, getInitValue(userFBId, playerName), callback);
    };

    var getCollection = function() {
      return that.collection;
    };

    var getOne = function(criteria, callback) {
      return DBManager.getOne(that.collection, criteria, callback);
    };


    return {
      createOrGet: createOrGet,
      collection: getCollection,
      save: save,
      getOne : getOne
    };

  }();

}());
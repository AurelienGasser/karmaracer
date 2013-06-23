(function() {
  "use strict";

  var DBManager = require('./DBManager');
  var KLib = require('./../classes/KLib');

  module.exports = function() {

    var that = {};
    DBManager.getCollection('cars', function(err, collection) {
      that.collection = collection;
    });

    var save = function(item, callback) {
      return DBManager.saveItem(getCollection(), {
        'carName': item.carName
      }, item, callback);
    }

    var getInitValue = function(carName) {
      return {
        carName: carName
      };
    }

    var createOrGet = function(carName, callback) {
      return DBManager.createOrGetItem(that.collection, {
        'carName': carName
      }, getInitValue(carName), callback);
    };

    var getCollection = function() {
      return that.collection;
    };

    return {
      createOrGet: createOrGet,
      collection: getCollection,
      save: save
    };

  }();

}());
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
        'name': item.name
      }, item, callback);
    }

    var getInitValue = function(name, path, w, h, displayName, price) {
      return {
        name: name,
        path: path,
        w: w,
        h: h,
        displayName: displayName, 
        price : price
      };
    }

    var createOrGet = function(carName, initValue, callback) {
      return DBManager.createOrGetItem(that.collection, {
        'name': carName
      }, initValue, callback);
    };

    var getCollection = function() {
      return that.collection;
    };

    function initCars() {
      var cars = [
        getInitValue('c1', '/sprites/c1.png', 128, 64, 'Classical Red', 0),
        getInitValue('c2', '/sprites/c2.png', 82, 36, 'Yellow Sport', 500),
        getInitValue('c3', '/sprites/c3.png', 72, 32, 'Super Sport', 5000),
        getInitValue('c4', '/sprites/c4.png', 74, 34, 'Grey Town', 10000),
        getInitValue('c5', '/sprites/c5.png', 81, 35, 'Black Shadow', 25000),
        getInitValue('c6', '/sprites/c6.png', 206, 130, 'Blue Cosmos', 50000)
      ];
      for (var i = 0; i < cars.length; i++) {
        var c = cars[i];
        createOrGet(c.name, c, function() {});
      };
    }
    initCars();


    return {
      createOrGet: createOrGet,
      collection: getCollection,
      save: save
    };

  }();

}());
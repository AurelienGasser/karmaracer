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

    var getInitValue = function(name, path, w, h, displayName) {
      return {
        name: name,
        path: path,
        w: w,
        h: h,
        displayName: displayName
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
        getInitValue('c1', '/sprites/car.png', 128, 64, 'Classical Red'),
        getInitValue('c2', '/sprites/car2.png', 82, 36, 'Yellow Sport'),
        getInitValue('c3', '/sprites/car3.png', 72, 32, 'Super Sport'),
        getInitValue('c4', '/sprites/car4.png', 74, 34, 'Grey Town'),
        getInitValue('c5', '/sprites/car5.png', 81, 35, 'Black Shadow')
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
var MongoClient = require('mongodb').MongoClient;
var KLib = require('./../classes/KLib');
var config = require('../../config');

module.exports = function() {
  var that = {};

  var getCollection = function(name, callback) {
    if (config.performanceTest) {
      return callback();
    }
    that.db.collection(name, function(err, collection) {
      if (err) {
        console.error('ERROR connecting to DB collection', err)
      } else {
        return callback(null, collection);
        console.info('connected to db');
      }
      callback(err);
    });
  }

  var connect = function(callback) {
    MongoClient.connect(config.mongoUri, function(err, db) {
      if (err) {
        console.error('ERROR connecting to DB', err)
        callback(err);
      } else {
        console.log('CONNECTED TO MONGO');
        that.db = db;
        callback(null, db);
      }
    });
  };

  var saveItem = function(collection, criteria, item, callback) {
    if (item && item !== null) {
      //clone
      var s = JSON.stringify(item);
      if (s === null) {
        return;
      }
      var updateItem = JSON.parse(s);
      if (updateItem === null) {
        return;
      }

      delete updateItem._id;
      collection.update(criteria, {
        $set: updateItem
      }, {
        upsert: true
      }, function(err) {
        if (err) {
          console.warn('err save item', err.message);
          if (KLib.isFunction(callback)) {
            return callback(err);
          }
        } else {
          if (KLib.isFunction(callback)) {
            return callback(null, item);
          }
        }
      });
    }
  };

  var getOne = function(collection, criteria, callback) {
    collection.find(criteria).toArray(function(err, results) {
      if (err) {
        return callback(err);
      }
      if (results.length === 1) {
        return callback(null, results[0]);
      } else {
        return callback('itemNotFound');
      }
    });
  };

  var insert = function(collection, initValue, callback) {
    collection.insert(initValue, function(err, results) {
      if (err) {
        return callback(err);
      }
      return callback(null, results[0]);
    });
  }

  var createOrGetItem = function(collection, criteria, initValue, callback) {
    getOne(collection, criteria, function(err, item) {
      if (err === 'itemNotFound') {
        return insert(collection, initValue, callback);
      }
      if (err) {
        return callback(err);
      }
      return callback(null, item);
    });
  }

  return {
    connect: connect,
    getCollection: getCollection,
    saveItem: saveItem,
    createOrGetItem: createOrGetItem,
    getOne: getOne
  }

}();

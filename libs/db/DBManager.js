var mongodb = require('mongodb');
var config = require('../../config');

module.exports = function() {
  var that = {};

  var getCollection = function(name, callback) {
    if (config.performanceTest) {
      return callback();
    }
    that.client.collection(name, function(err, collection) {
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
    that.client = new mongodb.Db('karmaracer', new mongodb.Server("127.0.0.1", 27017, {}), {
      w: 1
    });
    that.client.open(function(err, p_client) {
      if (err) {
        console.error('ERROR connecting to DB', err)
        callback(err);
      } else {
        that.db = p_client;
        var UserController = require('./UserController');
        console.info('CONNECTED TO MONGO');
        callback(null, p_client);
      }
    });
  };

  return {
    connect: connect,
    getCollection : getCollection
  }

}();


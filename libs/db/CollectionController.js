// (function() {
//   "use strict";

//   var DBManager = require('./DBManager');
//   var KLib = require('./../classes/KLib');

//   module.exports = function() {

//     var that = {};
//     DBManager.getCollection('cars', function(err, users) {
//       that.cars = cars;
//     });

//     var saveCar = function(item, callback) {
//       saveItem(item, getCarCollection(), item, {
//         'carName': item.carName
//       }, function(err) {

//       });
//     }




//     var createOrGetUser = function(userFBId, playerName, callback) {
//       that.users.find({
//         'fbid': userFBId
//       }).toArray(function(err, results) {
//         if (err) {
//           return callback(err);
//         }
//         if (results.length === 0) {
//           that.users.insert({
//             'fbid': userFBId,
//             'victories': 0,
//             'currentCar': 'car1',
//             'highScore': 0,
//             'playerName': playerName
//           }, function(err, results) {
//             if (err) {
//               return callback(err);
//             }
//             return callback(null, results[0]);
//           });
//         } else {
//           return callback(null, results[0]);
//         }
//       });
//     };

//     var getCarCollection = function() {
//       return that.cars;
//     };

//     return {
//       createOrGetUser: createOrGetUser,
//       users: getCarsCollection,
//       saveCar: saveCar
//     };

//   }();

// }());
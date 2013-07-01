var KLib = require('./../classes/KLib');
var UserController = require('./../db/UserController');
var CarController = require('./../db/CarController');


module.exports = function(client) {

  var user = client.handshake.session.user;
  if (!KLib.isUndefined(user)) {


    client.on('getCars', function(callback) {
      return CarController.collection().find().sort({
        'price': -1
      }).toArray(callback);
    });

    client.on('useCar', function(info, callback) {
      user.currentCar = info.carName;
      UserController.save(user, callback);
    });

    client.on('getCurrentUser', function(callback) {
      return callback(null, user);
    });


    client.on('buyCar', function(info, callback) {
      CarController.createOrGet(info.carName, {}, function(err, car) {
        if (user.money > car.price) {
          user.money -= car.price;
          client.emit('moneyUpdated', user);
          user.cars.push(car.name);
          UserController.save(user, function(err) {
            return callback(null, user);
          });
        } else {
          return callback('notEnoughMoney');
        }
      });
    });
  }
}
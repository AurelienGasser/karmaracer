var KLib = require('./../classes/KLib');
var UserController = require('./../db/UserController');
var CarController = require('./../db/CarController');


module.exports = function(client) {

  var user = client.handshake.session.user;
  if (!KLib.isUndefined(user)) {


    client.on('useCar', function(info, callback) {
      user.currentCar = info.carName;
      UserController.save(user, callback);
    });


    client.on('buyCar', function(info, callback) {
      console.log('buyCar', info);


      console.log('user', user);

      CarController.createOrGet(info.carName, {}, function(err, car) {
        console.log('car', car);
        if (user.highScore > car.price) {
        user.highScore -= car.price;
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
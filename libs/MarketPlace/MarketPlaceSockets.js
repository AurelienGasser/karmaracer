var KLib = require('./../classes/KLib');
var UserController = require('./../db/UserController');
var CarController = require('./../db/CarController');


module.exports = function(client) {
  client.on('buyCar', function(info, callback) {
    console.log('buyCar', info);

    var user = client.handshake.session.user;

    console.log('user', user);
    if (!KLib.isUndefined(user)) {

      CarController.createOrGet(info.carName, {}, function(err, car) {
        console.log('car', car);
        // if (user.highScore > car.price) {
          user.highScore -= car.price;
          user.cars.push(car.name);
        // }
        
        UserController.save(user, function(err){
          console.log('err', err);
        });
      });


    }
  });
}
var DBManager = require('./libs/db/DBManager');
DBManager.connect(function(err, client) {

  var UserController = require('./libs/db/UserController');


  function boosUser(id) {
    UserController.getOne({
      fbid: id
    }, function(err, user) {
      if (err){
        return console.error(err);
      }
      user.cars = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'];
      UserController.save(user, function(err, u) {
        console.log(u);
      });
    });
  }

  boosUser('100005805850062');
  boosUser('797325065');
  boosUser('655129182');


});
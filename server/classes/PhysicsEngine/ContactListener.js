var box2d = require('box2dweb-commonjs');

var ContactListener = function(gameServer) {
  this.gameServer = gameServer;
  this.init();
}

ContactListener.prototype.init = function() {
  var b2ContactListener = box2d.Box2D.Dynamics.b2ContactListener;
  this.listener = new b2ContactListener;
  var that = this;

  function swap(o1, o2, callback) {
    callback(o1, o2);
    callback(o2, o1);
  }

  function sensorVSwall(f1, f2) {
    return (f1.IsSensor() && (['wall', 'stone'].indexOf(f2.GetBody().GetUserData().name) != -1))
  }

  this.listener.BeginContact = function(contact) {
    var f1 = contact.GetFixtureA();
    var f2 = contact.GetFixtureB();
    var o1 = f1.GetBody().GetUserData();
    var o2 = f2.GetBody().GetUserData();
    swap(o1, o2, function(o1, o2){
      if(sensorVSwall(f1, f2)) {
        if (o1.playerCar && o1.playerCar.isBot) {
          o1.playerCar.player.sensorBegin();
        }
      } else if (o1.name === 'bullet' && o2.name !== 'bullet'
       || o1.name === 'rocket' && o2.name !== 'rocket') {
         if (o1.playerCar != o2.playerCar) {
           o1.explode(contact.GetFixtureA().GetBody().GetPosition());
         }
      }
      if (o2.name === 'car' && (o1.name === 'bullet' || o1.name == 'rocket')) {
        if (o1.playerCar != o2.playerCar) {
          that.gameServer.carManager.projectileHitCar(o1.playerCar, o2.playerCar, o1)
        }
      }
    });
  }

  this.listener.EndContact = function(contact) {
    var f1 = contact.GetFixtureA();
    var f2 = contact.GetFixtureB();
    var o1 = f1.GetBody().GetUserData();
    var o2 = f2.GetBody().GetUserData();
    swap(o1, o2, function(o1, o2){
      if(sensorVSwall(f1, f2)) {
        if (o1.playerCar && o1.playerCar.isBot) {
          o1.playerCar.player.sensorEnd();
        }
      }
    });
  }

  this.listener.PostSolve = function(contact, impulse) {
  }

  this.listener.PreSolve = function(contact, oldManifold) {
  }
}

module.exports = ContactListener;
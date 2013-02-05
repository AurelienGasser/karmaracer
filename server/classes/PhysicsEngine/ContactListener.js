var box2d = require('box2dweb-commonjs');

console.log('loading contact listener...')

var b2ContactListener = box2d.Box2D.Dynamics.b2ContactListener;
var listener = new b2ContactListener;

function swap(o1, o2, callback) {
  callback(o1, o2);
  callback(o2, o1);
}

function sensorVSwall(f1, f2) {
  return (f1.IsSensor() && (['wall', 'stone'].indexOf(f2.GetBody().GetUserData().name) != -1))
}

listener.BeginContact = function(contact) {
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
    } else if(o2.name === 'car' && (o1.name === 'bullet' || o1.name == 'rocket')) {
      if (o1.playerCar != o2.playerCar) {
        gameServer.carManager.projectileHitCar(o1.playerCar, o2.playerCar, o1)
      }
    }
  });
}

listener.EndContact = function(contact) {
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

listener.PostSolve = function(contact, impulse) {
}

listener.PreSolve = function(contact, oldManifold) {
}

module.exports = listener;
var box2d = require('box2dweb-commonjs');

console.log('loading contact listener...')

var b2ContactListener = box2d.Box2D.Dynamics.b2ContactListener;
var listener = new b2ContactListener;

function swap(o1, o2, callback) {
  callback(o1, o2);
  callback(o2, o1);
}

listener.BeginContact = function(contact) {
  var fa = contact.GetFixtureA();
  var fb = contact.GetFixtureB();
  var o1 = fa.GetBody().GetUserData();
  var o2 = fb.GetBody().GetUserData();
  swap(o1, o2, function(o1, o2){
    if(fa.IsSensor() && o2.name =='wall') {
      console.log('sensor !')
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
}

listener.PostSolve = function(contact, impulse) {
}

listener.PreSolve = function(contact, oldManifold) {
}

module.exports = listener;
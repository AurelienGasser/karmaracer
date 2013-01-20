var BulletManager = function() {
    var Bullet = require('./PhysicsEngine/Bullet');

    this.bullets = [];
    var that = this;


    function updateBullets(engine) {
      var deads = [];
      for(var id in that.bullets) {
        if(that.bullets.hasOwnProperty(id)) {
          var bullet = that.bullets[id];
          if(bullet.body === null) {
//            console.log(bullet.body);
            deads.push(id);
          } else {
            bullet.accelerate(500);
            bullet.life -= 1;
            if(bullet.life < 0) {
              deads.push(id);
            }
          }
        }
      }
      for(var i = 0; i < deads.length; i++) {
        var id = deads[i];
        var b = that.bullets[id];
        if (b.body !== null){
          // console.log(b.body);
          engine.world.DestroyBody(b.body);
        }
        delete that.bullets[id];
      };
    }

    var add = function(car) {

        var b = new Bullet(car);
        b.accelerate(1);
        that.bullets[b.id] = b;

      }

    var getGraphicBullets = function() {
        var graphics = [];
        for(var id in that.bullets) {
          if(that.bullets.hasOwnProperty(id)) {
            var bullet = that.bullets[id];
            graphics.push(bullet.getShared());
          }
        }
        return graphics;
      }

    return {
      'getGraphicBullets': getGraphicBullets,
      'updateBullets': updateBullets,
      'add': add
    };

  }();

module.exports = BulletManager;
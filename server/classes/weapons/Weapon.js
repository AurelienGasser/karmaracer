var Weapon = function() {
    this.projectiles = {};
    this.accelerate = 500;
    this.lastShot = null;
  }


Weapon.prototype.deleteDeads = function(deads) {
  for(var i = 0; i < deads.length; i++) {
    var id = deads[i];
    delete this.projectiles[id];
  };
};

Weapon.prototype.step = function() {
  var deads = [];
  for(var id in this.projectiles) {
    if(this.projectiles.hasOwnProperty(id)) {
      var projectile = this.projectiles[id];
      if(projectile.body === null) {
        deads.push(id);
      } else {
        projectile.accelerate(this.accelerate);
        projectile.life -= 1;
        if(projectile.life <= 0) {
          projectile.scheduleForDestroy();
          deads.push(id);
        }
      }
    }
  }
  this.deleteDeads(deads);
};

Weapon.prototype.getGraphics = function(){
  var graphics = [];
  for(var id in this.projectiles) {
    if(this.projectiles.hasOwnProperty(id)) {
      var projectile = this.projectiles[id];
      graphics.push(projectile.getShared());
    }
  }
  return graphics;

}


module.exports = Weapon;
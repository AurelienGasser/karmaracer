var Body_move = require('./Body_move');
var Body_shared = require('./Body_shared');
var Body_cache = require('./Body_cache');
var G_bodyID = 0;

var Body = function() {
  return this;
}

Body.prototype.initialize = function(engine, position, size) {
  this.engine = engine;
  this.gScale = this.engine.gScale;
  this.id = G_bodyID++;
  this.x = position.x;
  this.y = position.y;
  this.w = size.w;
  this.h = size.h;
  this.r = position.r || 0;
  this.radius = size.radius || Math.sqrt(size.w * size.w + size.h * size.h);
  this.playerName = 'b' + this.id;
  this.name = 'body';
  this.s = 0;
  this.l = 0;
  this.wDiv2 = this.w / 2;
  this.hDiv2 = this.h / 2;
  this.color = '#FFF';
  this.projections = [];
  this.resetCollisions();
  this.updateCornerCache();
  this.isStatic = false;
  this.isBullet = false;
  this.shareCollisionInfo = engine.shareCollisionInfo;
  this.moveToPosition = this.getPositionAndAngle();
  this.oldPosition = this.getPositionAndAngle();
}

Body.prototype.scheduleForDestroy = function() {
  this.engine.itemsToDestroy.push(this);
}

Body.prototype.destroy = function() {
  this.engine = null;
}

Body.prototype.getPosition = function() {
  return {
    x: this.x,
    y: this.y
  };
}

Body.prototype.resetCollisions = function(ac) {
  this.collidesWith = null;
  // this.moveToPosition = this.getPositionAndAngle();
}

Body.prototype.getVector = function(power, angle) {
  if (!angle) {
    angle = 0;
  }
  angle += this.r;
  var v = {
    x: power.x * Math.cos(angle),
    y: power.y * Math.sin(angle)
  };
  return v;
}

Body.prototype.getNumCollisions = function() {
  var res = 0;
  for (var i in this.collidesWith) {
    ++res;
  }
  return res;
}

Body.prototype.performCollideAction = function(oldPosition) {
  // must be overriden in children classes
};

Body.prototype.getPositionAndAngle = function(first_argument) {
  var pos = {
    x: this.x,
    y: this.y,
    r: this.r
  };
  return pos;
};

// extend Body methods with Body_move
for (var method in Body_move) {
  Body.prototype[method] = Body_move[method];
}

// extend Body methods with Body_shared
for (var method in Body_shared) {
  Body.prototype[method] = Body_shared[method];
}
// extend Body methods with Body_cache
for (var method in Body_cache) {
  Body.prototype[method] = Body_cache[method];
}

module.exports = Body;
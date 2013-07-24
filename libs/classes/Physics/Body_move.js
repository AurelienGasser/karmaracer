var KLib = require('./../KLib');
var sharedConfig = require('./../../../config_shared');

var COLLISION_DISTANCE_TRESHOLD = 5e-10;

var Body_move = {};

var forcpt = 0;

Body_move.getTransientPosition = function() {
  return {
    x: this.moveToPosition !== null && !KLib.isUndefined(this.moveToPosition.x) ? this.moveToPosition.x : this.x,
    y: this.moveToPosition !== null && !KLib.isUndefined(this.moveToPosition.y) ? this.moveToPosition.y : this.y,
    r: this.moveToPosition !== null && !KLib.isUndefined(this.moveToPosition.r) ? this.moveToPosition.r : this.r,
  }
}

Body_move.accelerate = function(ac) {
  var pos = this.getTransientPosition();
  var newpos = {
    x: pos.x + ac * Math.cos(pos.r),
    y: pos.y + ac * Math.sin(pos.r)
  };
  this.moveTo(newpos);
  // this.forcpt = this.forcpt ? this.forcpt + 1 : 1;
  forcpt += 1;
  console.log(forcpt, (Date.now() % 1000), newpos);
}

Body_move.accelerateAndTurn = function(ac, a) {
  var pos = this.getTransientPosition();
  var newpos = {
    x: pos.x + ac * Math.cos(pos.r),
    y: pos.y + ac * Math.sin(pos.r),
    r: (pos.r + a) % (Math.PI * 2)
  };
  this.moveTo(newpos);
}

Body_move.turn = function(side) {
  var pos = this.getTransientPosition();
  var angleToAdd = side * (Math.PI * 1.5);
  this.moveTo({
    r: (pos.r + angleToAdd) % (Math.PI * 2)
  });
}

Body_move.setPosition = function(data) {
  if (typeof data.x != 'undefined') {
    this.x = data.x;
  }
  if (typeof data.y != 'undefined') {
    this.y = data.y;
  }
  if (typeof data.r != 'undefined') {
    this.r = data.r;
  }
}

function getMiddle(from, to) {
  var res = {}
  if (typeof to.x != 'undefined') {
    res.x = (to.x + from.x) / 2;
  }
  if (typeof to.y != 'undefined') {
    res.y = (to.y + from.y) / 2;
  }
  if (typeof to.r != 'undefined') {
    res.r = (to.r + from.r) / 2;
  }
  return res;
}

function positive(x) {
  return x > 0 ? x : -x;
}

function getDistance(from, to) {
  var res = 0;
  if (typeof to.x != 'undefined') {
    res += positive(to.x - from.x);
  }
  if (typeof to.y != 'undefined') {
    res += positive(to.y - from.y);
  }
  if (typeof to.r != 'undefined') {
    res += positive(to.r - from.r);
  }
  return res;
}

function dup(pos) {
  return {
    x: pos.x,
    y: pos.y,
    r: pos.r
  }
}

Body_move.doMove = function() {
  if (!this.moveToPosition) {
    return;
  }
  this.oldPosition = this.getPositionAndAngle();
  var pos;
  pos = dup(this.moveToPosition);
  this.setPosition(pos);
  this.updateCornerCache();
  var collision = this.engine.checkCollisions(this);
  if (collision) {
    var movedDicho = false;
    if (sharedConfig.physics.dichotomyIterations != 0) {
      this.moveToDichotomie(dup(this.oldPosition), pos);
      var before = this.oldPosition;
      var after = this.getPositionAndAngle();
      var dist = getDistance(before, after);
      movedDicho = dist > COLLISION_DISTANCE_TRESHOLD
    }
    if (!movedDicho) {
      this.x = this.oldPosition.x;
      this.y = this.oldPosition.y;
      if (this.moveToPosition.r) {
        this.r = this.moveToPosition.r;
      }
    }
    this.updateCornerCache();
  }
  this.moveToPosition = null;
};

Body_move.moveToDichotomie = function(from, to) {
  var it = 1;
  while (true) {
    var distance = getDistance(from, to);
    if (it > sharedConfig.physics.dichotomyIterations) {
      this.setPosition(from);
      return true;
    } else {
      var mid = getMiddle(from, to);
      this.setPosition(mid);
      this.updateCornerCache();
      this.collidesWith = null;
      var res = this.engine.checkCollisions(this);
      if (res === false) {
        from = mid;
      } else {
        to = mid;
      }
    }
    ++it;
  }
}

Body_move.moveTo = function(pos) {
  if (this.moveToPosition === null) {
    this.moveToPosition = {};
  }
  if (!KLib.isUndefined(pos.x)) {
    this.moveToPosition.x = pos.x;
  }
  if (!KLib.isUndefined(pos.y)) {
    this.moveToPosition.y = pos.y;
  }
  if (!KLib.isUndefined(pos.r)) {
    this.moveToPosition.r = pos.r;
  }
}

module.exports = Body_move;
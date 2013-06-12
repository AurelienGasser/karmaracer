var KLib = require('./../KLib');
var G_bodyID = 0;
var CONFIG = require('./../../../config');

var PhysicalBody = function() {
  return this;
}

PhysicalBody.prototype.initialize = function(engine, position, size) {
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
  this.oldMoveToPosition = this.getPositionAndAngle();
}

PhysicalBody.prototype.resetCollisions = function(ac) {
  this.collidesWith = null;
  // this.moveToPosition = this.getPositionAndAngle();
}

PhysicalBody.prototype.accelerateVector = function(vector) {
  var newpos = {
    x: this.x + vector.x * Math.cos(this.r),
    y: this.y + vector.y * Math.sin(this.r)
  };
  this.moveTo(newpos);
}


PhysicalBody.prototype.accelerate = function(ac) {
  var newpos = {
    x: this.x + ac * Math.cos(this.r),
    y: this.y + ac * Math.sin(this.r)
  };
  this.moveTo(newpos);
}

PhysicalBody.prototype.accelerateAndTurn = function(ac, a) {
  var newpos = {
    x: this.x + ac * Math.cos(this.r),
    y: this.y + ac * Math.sin(this.r),
    r: (this.r + a) % (Math.PI * 2)
  };
  this.moveTo(newpos);
}

PhysicalBody.prototype.scheduleForDestroy = function() {
  this.engine.itemsToDestroy.push(this);
}

PhysicalBody.prototype.destroy = function() {
  this.engine = null;
}

PhysicalBody.prototype.getPosition = function() {
  return {
    x: this.x,
    y: this.y
  };
}

var subVectors = function(a, b) {
  return {
    x: a.x - b.x,
    y: a.y - b.y
  }
}

PhysicalBody.prototype.addVectors = function(a, b) {
  return {
    x: a.x + b.x,
    y: a.y + b.y
  }
}

PhysicalBody.prototype.getVector = function(power, angle) {
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

PhysicalBody.prototype.addAngle = function(a) {
  this.moveTo({
    r: (this.r + a) % (Math.PI * 2)
  });
}

PhysicalBody.prototype.turn = function(side) {
  var angleToAdd = side * (Math.PI * 1.5);
  this.addAngle(angleToAdd);
}

PhysicalBody.prototype.setPosition = function(data) {
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

PhysicalBody.prototype.getNumCollisions = function() {
  var res = 0;
  for (var i in this.collidesWith) {
    ++res;
  }
  return res;
}

PhysicalBody.prototype.getPosFriction = function(_old, _new, angle, forward) {
  var initialMove = subVectors(_new, _old);
  var forward = 0.1;
  var newAngle = this.r + angle;
  var res = {
    x: this.x + (forward * Math.cos(newAngle)),
    y: this.y + (forward * Math.sin(newAngle)),
    r: newAngle
  };
  return res;
}

PhysicalBody.prototype.getPositionsWithFriction = function(_old, _new) {
  return [, this.getPosFriction(_old, _new, 0.1, 0.25), this.getPosFriction(_old, _new, 0.05, 0.115), this.getPosFriction(_old, _new, 0.0001, 0), this.getPosFriction(_old, _new, -0.1, 0.25), this.getPosFriction(_old, _new, -0.05, 0.115), this.getPosFriction(_old, _new, -0.0001, 0)];
}

PhysicalBody.prototype.performCollideAction = function(oldPosition) {
  // must be overriden in children classes
};

PhysicalBody.prototype.getPositionAndAngle = function(first_argument) {
  var pos = {
    x: this.x,
    y: this.y,
    r: this.r
  };
  return pos;
};

function dup(pos) {
  return {
    x: pos.x,
    y: pos.y,
    r: pos.r
  }
}

var COLLISION_DISTANCE_TRESHOLD = 5e-10;

PhysicalBody.prototype.doMove = function() {
  if (!this.moveToPosition) {
    return;
  }
  this.oldMoveToPosition = this.getPositionAndAngle();
  var pos;
  pos = dup(this.moveToPosition);
  this.setPosition(pos);
  this.updateCornerCache();
  var collision = this.engine.checkCollisions(this);
  if (collision) {
    var movedDicho = false;
    if (CONFIG.physics.dichotomyIterations != 0) {
      this.moveToDichotomie(dup(this.oldMoveToPosition), pos);
      var before = this.oldMoveToPosition;
      var after = this.getPositionAndAngle();
      var dist = getDistance(before, after);
      movedDicho = dist > COLLISION_DISTANCE_TRESHOLD
    }
    if (!movedDicho) {
      this.x = this.oldMoveToPosition.x;
      this.y = this.oldMoveToPosition.y;
      if (this.moveToPosition.r) {
        this.r = this.moveToPosition.r;
      }
    }
    this.updateCornerCache();
  }
  this.moveToPosition = null;
};

PhysicalBody.prototype.moveToDichotomie = function(from, to) {
  var it = 0;
  while (true) {
    var distance = getDistance(from, to);
    if (it > CONFIG.physics.dichotomyIterations) {
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

PhysicalBody.prototype.moveTo = function(pos) {
  if (this.moveToPosition === null) {
    this.moveToPosition = {};
  }
  if (!KLib.isUndefined(pos.x)) {
    // pos.x = this.x;
    this.moveToPosition.x = pos.x;
  } else {
    // delete this.moveToPosition.x;
  }
  if (!KLib.isUndefined(pos.y)) {
    // pos.y = this.y;
    this.moveToPosition.y = pos.y;
  } else {
    // delete this.moveToPosition.y;
  }
  if (!KLib.isUndefined(pos.r)) {
    // pos.r = this.r;
    this.moveToPosition.r = pos.r;
  } else {
    // delete this.moveToPosition.r;
  }
}

PhysicalBody.prototype.cosWidthDiv2 = function() {
  return Math.cos(this.r) * this.wDiv2;
};

PhysicalBody.prototype.sinHeightDiv2 = function() {
  return Math.cos(this.r) * this.wDiv2;
};

PhysicalBody.prototype.rotate = function(x, y) {
  return {
    x: x * Math.cos(this.r) - y * Math.sin(this.r),
    y: x * Math.sin(this.r) + y * Math.cos(this.r)
  }
}

PhysicalBody.prototype.translate = function(coord) {
  return {
    x: coord.x + this.x,
    y: coord.y + this.y
  };
};

PhysicalBody.prototype.getCorners = function() {
  return [
  this.rotate(+this.wDiv2, +this.hDiv2), this.rotate(-this.wDiv2, +this.hDiv2), this.rotate(+this.wDiv2, -this.hDiv2), this.rotate(-this.wDiv2, -this.hDiv2)]
};

var compareY = function(c1, c2) {
  return c2.y - c1.y;
}

var compareX = function(c1, c2) {
  return c2.x - c1.x;
}

PhysicalBody.prototype.updateCornerCache = function() {
  this.corners = this.getCorners();
  this.a1 = this.axis1();
  this.a2 = this.axis2();
  this.projections[1] = this.getAxisProjections(this.a1);
  this.projections[2] = this.getAxisProjections(this.a2);
};

PhysicalBody.prototype.UR = function() {
  var maxY = this.corners.sort(compareY);
  var maxX = maxY.slice(0, 2).sort(compareX);
  return maxX[0];
};

PhysicalBody.prototype.UL = function() {
  var minY = this.corners.sort(compareY);
  var maxX = minY.slice(0, 2).sort(compareX);
  return maxX[1];
};

PhysicalBody.prototype.BR = function() {
  var minY = this.corners.sort(compareY).reverse();
  var maxX = minY.slice(0, 2).sort(compareX);
  return maxX[0];
};

PhysicalBody.prototype.BL = function() {
  var minY = this.corners.sort(compareY).reverse();
  var maxX = minY.slice(0, 2).sort(compareX);
  return maxX[1];
};

PhysicalBody.prototype.axis1 = function() {
  var ur = this.UR();
  var ul = this.UL();
  var a1 = {
    x: ur.x - ul.x,
    y: ur.y - ul.y
  };
  if (a1.x < 0) {
    a1 = {
      x: -a1.x,
      y: -a1.y
    }
  }
  return a1;
};

PhysicalBody.prototype.axis2 = function() {
  var ur = this.translate(this.UR());
  var br = this.translate(this.BR());
  var a2 = {
    x: ur.x - br.x,
    y: ur.y - br.y
  };
  if (a2.x < 0) {
    a2 = {
      x: -a2.x,
      y: -a2.y
    }
  }
  return a2;
};

PhysicalBody.prototype.getAxisProjections = function(axis) {
  var aProjectionUL = this.engine.projection(this.UL(), axis, this.playerName + 'aUL');
  var aProjectionUR = this.engine.projection(this.UR(), axis, this.playerName + 'aUR');
  var aProjectionBL = this.engine.projection(this.BL(), axis, this.playerName + 'aBL');
  var aProjectionBR = this.engine.projection(this.BR(), axis, this.playerName + 'aBR');
  var aULValue = this.engine.scalarValue(aProjectionUL, axis);
  var aURValue = this.engine.scalarValue(aProjectionUR, axis);
  var aBLValue = this.engine.scalarValue(aProjectionBL, axis);
  var aBRValue = this.engine.scalarValue(aProjectionBR, axis);
  if (this.shareCollisionInfo) {
    this.p1 = aProjectionUL;
    this.p2 = aProjectionUR;
    this.p3 = aProjectionBL;
    this.p4 = aProjectionBR;
  }
  var aProjections = [];
  aProjections.push({
    scalar: aULValue,
    p: aProjectionUL
  });
  aProjections.push({
    scalar: aURValue,
    p: aProjectionUR
  });
  aProjections.push({
    scalar: aBLValue,
    p: aProjectionBL
  });
  aProjections.push({
    scalar: aBRValue,
    p: aProjectionBR
  });
  return aProjections;
};


PhysicalBody.prototype.scalePoint = function(p) {
  if (!p) {
    return {
      x: 0,
      y: 0
    }
  }
  var scaled = {
    x: p.x * this.gScale,
    y: p.y * this.gScale,
    name: p.name
  };
  return scaled;
};

PhysicalBody.prototype.scalePointAndAddName = function(name, p) {
  var scaled = {
    x: p.x * this.gScale,
    y: p.y * this.gScale
  };
  scaled.name = name;
  return scaled;
};

PhysicalBody.prototype.scaleAxesMinMax = function(minMax) {
  var res = {}
  var gScale = this.gScale;
  for (var i in minMax) {
    res[i] = {};
    ['minA', 'maxA', 'minB', 'maxB'].forEach(function(type) {
      res[i][type] = {
        x: minMax[i][type].p.x * gScale,
        y: minMax[i][type].p.y * gScale,
        name: type,
      }
    })
  }
  return res;
}

PhysicalBody.prototype.getShared = function() {

  var options = {
    x: this.x * this.gScale,
    y: this.y * this.gScale,
    w: this.w * this.gScale,
    h: this.h * this.gScale,
    r: this.r,
    name: this.name,
    playerName: this.playerName
  };

  options.id = this.id;

  if (!KLib.isUndefined(this.len)) {
    // options.p1 = this.p1;
    // options.p2 = this.p2;
    // // options.p3 = this.p3;
    // options.p1.x *= this.gScale;
    // options.p1.y *= this.gScale;
    // options.p2.x *= this.gScale;
    // options.p2.y *= this.gScale;
    // options.p3.x *= this.gScale;
    // options.p3.y *= this.gScale;
    options.len = this.len * this.gScale;
  }

  if (this.shareCollisionInfo) {
    var ul = this.UL();
    var ur = this.UR();
    var br = this.BR();
    var bl = this.BL();
    var collides = this.collidesWith !== null;
    var collision = {
      ul: this.scalePointAndAddName('ul', ul),
      ur: this.scalePointAndAddName('ur', ur),
      bl: this.scalePointAndAddName('bl', bl),
      br: this.scalePointAndAddName('br', br),
      color: collides ? '#F00' : '#FFF',
      a1: this.a1,
      a2: this.a2,
      p1: this.scalePoint(this.p1),
      p2: this.scalePoint(this.p2),
      p3: this.scalePoint(this.p3),
      p4: this.scalePoint(this.p4),
      p5: this.scalePoint(this.p5),
      p6: this.scalePoint(this.p6),
      bUL: this.scalePoint(this.bUL),
      bUR: this.scalePoint(this.bUR),
      bBL: this.scalePoint(this.bBL),
      bBR: this.scalePoint(this.bBR),
      axesMinMax: this.scaleAxesMinMax(this.axesMinMax)
    }
    if (this.collidesWith !== null) {
      collision.a3 = this.collidesWith.a1;
      collision.a4 = this.collidesWith.a2;
    }
    options.collision = collision;
  }


  return options;
};

module.exports = PhysicalBody;
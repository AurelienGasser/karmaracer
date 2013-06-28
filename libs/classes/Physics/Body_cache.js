var PhysicsUtils = require('./Utils');

var Body_cache = {};

Body_cache.cosWidthDiv2 = function() {
  return Math.cos(this.r) * this.wDiv2;
};

Body_cache.sinHeightDiv2 = function() {
  return Math.cos(this.r) * this.wDiv2;
};

Body_cache.rotate = function(x, y) {
  return {
    x: x * Math.cos(this.r) - y * Math.sin(this.r),
    y: x * Math.sin(this.r) + y * Math.cos(this.r)
  }
}

Body_cache.translate = function(coord) {
  return {
    x: coord.x + this.x,
    y: coord.y + this.y
  };
};

Body_cache.getCorners = function() {
  return [
  this.rotate(+this.wDiv2, +this.hDiv2), this.rotate(-this.wDiv2, +this.hDiv2), this.rotate(+this.wDiv2, -this.hDiv2), this.rotate(-this.wDiv2, -this.hDiv2)]
};

Body_cache.updateCornerCache = function() {
  this.corners = this.getCorners();
  this.getUR();
  this.getUL();
  this.getBR();
  this.getBL();
  this.a1 = this.axis1();
  this.a2 = this.axis2();
  this.projections[1] = this.getAxisProjections(this.a1);
  this.projections[2] = this.getAxisProjections(this.a2);
};

var compareX = function(c1, c2) {
  return c2.x - c1.x;
}

var compareY = function(c1, c2) {
  return c2.y - c1.y;
}

Body_cache.getUR = function() {
  var maxY = this.corners.sort(compareY);
  var maxX = maxY.slice(0, 2).sort(compareX);
  this.UR = maxX[0];
};

Body_cache.getUL = function() {
  var minY = this.corners.sort(compareY);
  var maxX = minY.slice(0, 2).sort(compareX);
  this.UL = maxX[1];
};

Body_cache.getBR = function() {
  var minY = this.corners.sort(compareY).reverse();
  var maxX = minY.slice(0, 2).sort(compareX);
  this.BR = maxX[0];
};

Body_cache.getBL = function() {
  var minY = this.corners.sort(compareY).reverse();
  var maxX = minY.slice(0, 2).sort(compareX);
  this.BL = maxX[1];
};

Body_cache.axis1 = function() {
  var a1 = {
    x: this.UR.x - this.UL.x,
    y: this.UR.y - this.UL.y
  };
  if (a1.x < 0) {
    a1 = {
      x: -a1.x,
      y: -a1.y
    }
  }
  return a1;
};

Body_cache.axis2 = function() {
  var ur = this.translate(this.UR);
  var br = this.translate(this.BR);
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

Body_cache.getAxisProjections = function(axis) {
  var aProjectionUL = PhysicsUtils.projection(this.UL, axis, this.playerName + 'aUL');
  var aProjectionUR = PhysicsUtils.projection(this.UR, axis, this.playerName + 'aUR');
  var aProjectionBL = PhysicsUtils.projection(this.BL, axis, this.playerName + 'aBL');
  var aProjectionBR = PhysicsUtils.projection(this.BR, axis, this.playerName + 'aBR');
  var aULValue = PhysicsUtils.scalarValue(aProjectionUL, axis);
  var aURValue = PhysicsUtils.scalarValue(aProjectionUR, axis);
  var aBLValue = PhysicsUtils.scalarValue(aProjectionBL, axis);
  var aBRValue = PhysicsUtils.scalarValue(aProjectionBR, axis);
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

module.exports = Body_cache;
var PhysicsUtils = require('./Utils');
var Body = require('./Body');
var KLib = require('./../KLib');

var Engine_collisions = {};

function compareScalar(c1, c2) {
  return c1.scalar - c2.scalar;
}

Engine_collisions.axisCollideCheck = function(axis, A, B, axisIndex) {
  var deltaBA = {
    x: B.x - A.x,
    y: B.y - A.y
  };

  A.bUL = PhysicsUtils.translate(B.UL, deltaBA);
  A.bUL.name = A.playerName + '.bUL';
  A.bUR = PhysicsUtils.translate(B.UR, deltaBA);
  A.bUR.name = A.playerName + '.bUR';
  A.bBL = PhysicsUtils.translate(B.BL, deltaBA);
  A.bBL.name = A.playerName + '.bBL';
  A.bBR = PhysicsUtils.translate(B.BR, deltaBA);
  A.bBR.name = A.playerName + '.bBR';

  var bProjectionUL = PhysicsUtils.projection(A.bUL, axis, A.playerName + 'bUL');
  var bProjectionUR = PhysicsUtils.projection(A.bUR, axis, A.playerName + 'bUR');
  var bProjectionBL = PhysicsUtils.projection(A.bBL, axis, A.playerName + 'bBL');
  var bProjectionBR = PhysicsUtils.projection(A.bBR, axis, A.playerName + 'bBR');

  var bULValue = PhysicsUtils.scalarValue(bProjectionUL, axis);
  var bURValue = PhysicsUtils.scalarValue(bProjectionUR, axis);
  var bBLValue = PhysicsUtils.scalarValue(bProjectionBL, axis);
  var bBRValue = PhysicsUtils.scalarValue(bProjectionBR, axis);

  var aProjections;
  if (axisIndex == 1 || axisIndex == 2) {
    // only use cache for axes 1 and 2
    aProjections = A.projections[axisIndex];
  } else {
    aProjections = A.getAxisProjections(axis);
  }

  A.p5 = bProjectionUL;
  A.p6 = bProjectionUR;
  A.p7 = bProjectionBL;
  A.p8 = bProjectionBR;

  var bProjections = [];
  bProjections.push({
    scalar: PhysicsUtils.scalarValue(bProjectionBL, axis),
    p: bProjectionBL
  });
  bProjections.push({
    scalar: PhysicsUtils.scalarValue(bProjectionBR, axis),
    p: bProjectionBR
  });
  bProjections.push({
    scalar: PhysicsUtils.scalarValue(bProjectionUL, axis),
    p: bProjectionUL
  });
  bProjections.push({
    scalar: PhysicsUtils.scalarValue(bProjectionUR, axis),
    p: bProjectionUR
  });

  var aSorted = aProjections.sort(compareScalar);
  var minA = aSorted[0].scalar;
  var maxA = aSorted[3].scalar;


  var bSorted = bProjections.sort(compareScalar);
  var minB = bSorted[0].scalar;
  var maxB = bSorted[3].scalar;

  if (this.shareCollisionInfo) {
    A.axesMinMax[axisIndex] = {
      minA: aSorted[0],
      maxA: aSorted[3],
      minB: bSorted[0],
      maxB: bSorted[3]
    };
  }

  if (minA < minB) {
    if (minB <= maxA) {
      return true;
    }
  } else {
    if (minA <= maxB) {
      return true;
    }
  }
  return false;
};

Engine_collisions.collideTest = function(A, B) {
  if (A.id === B.id) {
    return false;
  }
  var radiusSum = A.radius + B.radius;
  if (Math.abs(A.x - B.x) >= radiusSum || Math.abs(A.y - B.y) >= radiusSum) {
    return false;
  }
  var axes = [A.a1, A.a2, B.a1, B.a2];
  var collides = true;
  A.axesMinMax = {};
  for (var i = 0; i < axes.length; i++) {
    var axis = axes[i];
    if (!this.axisCollideCheck(axis, A, B, i + 1)) {
      collides = false;
      break;
    }
  };
  return collides;
};


// returns point of impact {x, y} or null
Engine_collisions.segmentCollideSegment = function(p, r, q, s) {
  // http://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect

  var r_times_s = PhysicsUtils.vectorCrossProduct(r, s);
  if (r_times_s === 0) {
    // segments are parallel
    return null;
  }

  var q_minus_p = {
    x: q.x - p.x,
    y: q.y - p.y
  };
  var t = PhysicsUtils.vectorCrossProduct(q_minus_p, s) / r_times_s;

  if (t < 0 || t > 1) {
    // on the line but out of segment
    return null;
  }
  var u = PhysicsUtils.vectorCrossProduct(q_minus_p, r) / r_times_s;
  if (u < 0 || u > 1) {
    // on the line but ouf of segment
    return null;
  }
  return {
    x: p.x + t * r.x,
    y: p.y + t * r.y
  }
  // return {
  //   x: q.x + u * s.x,
  //   y: q.y + u * s.y
  // }
};

// returns a list of collision points [{x, y}, {x, y}] or an empty list []
Engine_collisions.bulletCollidesBody = function(projectile, B) {
  var pBullet = projectile.pBullet,
    vBullet = projectile.vBullet;

  var p1 = PhysicsUtils.translate(B.UL, B);
  var p2 = PhysicsUtils.translate(B.UR, B);
  var p3 = PhysicsUtils.translate(B.BR, B);
  var p4 = PhysicsUtils.translate(B.BL, B);

  var v1 = PhysicsUtils.getVector(B.UL, B.UR);
  var v2 = PhysicsUtils.getVector(B.UR, B.BR);
  var v3 = PhysicsUtils.getVector(B.BR, B.BL);
  var v4 = PhysicsUtils.getVector(B.BL, B.UL);
  var i1 = this.segmentCollideSegment(pBullet, vBullet, p1, v1);
  var i2 = this.segmentCollideSegment(pBullet, vBullet, p2, v2);
  var i3 = this.segmentCollideSegment(pBullet, vBullet, p3, v3);
  var i4 = this.segmentCollideSegment(pBullet, vBullet, p4, v4);

  var points = [i1, i2, i3, i4];
  var res = [];
  for (var i in points) {
    if (points[i] !== null) {
      res.push(points[i])
    }
  }
  return res
};

// return collision point {x, y} or null
Engine_collisions.bulletCollideWall = function(projectile) {
  var pBullet = projectile.pBullet,
    vBullet = projectile.vBullet;

  var walls = []; // list of segments
  walls.push({ p: { x: 0, y: 0 }, v: { x: this.map.size.w, y: 0 } });
  walls.push({ p: { x: 0, y: 0 }, v: { x: 0, y: this.map.size.h } });
  walls.push({ p: { x: this.map.size.w, y: this.map.size.h }, v: { x: -this.map.size.w, y: 0 } });
  walls.push({ p: { x: this.map.size.w, y: this.map.size.h }, v: { x: 0, y: -this.map.size.h } });

  for (var i = 0; i < walls.length; i++) {
    var w = walls[i];
    var collide = this.segmentCollideSegment(pBullet, vBullet, w.p, w.v);
    if (collide !== null) {
      return collide;
    }
  }
  return null;
}

Engine_collisions.bulletCollision = function(projectile) {
  var pointsAndBullets = [];
  for (var bID in this.bodies) {
    var B = this.bodies[bID];
    if (projectile.playerCar.car.id === B.id) {
      continue; // don't collide with own car
    }
    if (!KLib.isUndefined(B.playerCar) && B.playerCar.dead === true) {
      continue;
    }
    var colPoints = this.bulletCollidesBody(projectile, B);
    for (var i = 0; i < colPoints.length; i++) {
      var p = colPoints[i];
      pointsAndBullets.push({
        body: B,
        point: p
      });
    };
  }
  // bullet necesarily collides with a wall
  pointsAndBullets.push({
    body: {
      name: 'outsideWall'
    },
    point: this.bulletCollideWall(projectile)
  });
  return PhysicsUtils.getClosestPoint(projectile, pointsAndBullets);
};

Engine_collisions.checkCollisions = function(body) {
  if (body.collidesWith !== null) {
    return true;
  }
  if (this.outOfWalls(PhysicsUtils.addVectors(body, body.UL)) || this.outOfWalls(PhysicsUtils.addVectors(body, body.UR)) || this.outOfWalls(PhysicsUtils.addVectors(body, body.BL)) || this.outOfWalls(PhysicsUtils.addVectors(body, body.BR))) {
    body.collidesWith = {
      name: 'outsideWall',
      isStatic: true
    };
    return true;
  }
  var A = body;
  for (var b2ID in this.bodies) {
    if (b2ID !== A.id) {
      var B = this.bodies[b2ID];
      if (!KLib.isUndefined(B.playerCar) && B.playerCar.dead === true) {
        continue;
      }
      if (this.collideTest(A, B)) {
        A.collidesWith = this.bodies[B.id];
        B.collidesWith = A;
        return true;
      } else {}
    }
  }

  return false;
}

module.exports = Engine_collisions;
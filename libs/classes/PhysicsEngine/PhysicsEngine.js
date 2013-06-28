var fs = require('fs');
var CONFIG = require('./../../../config');
var KLib = require('./../KLib');
var PhysicsUtils = require('./PhysicsUtils');
var PhysicalBody = require('./PhysicalBody');

var G_bodyID = 0;
var PhysicsEngine = function(size, map) {
  this.shareCollisionInfo = false;
  this.itemsToDestroy = [];
  this.bodies = {};
  this.gScale = 1;
  this.staticItemTypes = {};
  this.map = map;
  this.setupWorld(size);
  this.loadStaticItems();
}

PhysicsEngine.prototype.destroyBodies = function() {
  for (var i in this.itemsToDestroy) {
    var item = this.itemsToDestroy[i];
    item.destroy();
    delete this.bodies[item.id];
  }
  this.itemsToDestroy = [];
};

PhysicsEngine.prototype.setupWorld = function(size) {
  this.size = size;
};

function compareScalar(c1, c2) {
  return c1.scalar - c2.scalar;
}

PhysicsEngine.prototype.axisCollideCheck = function(axis, A, B, axisIndex) {
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

PhysicsEngine.prototype.collideTest = function(A, B) {
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

PhysicsEngine.prototype.outOfWalls = function(point) {
  var res = point.x < 0 || point.y < 0 || point.x > this.map.size.w || point.y > this.map.size.h
  return res;
}

PhysicsEngine.prototype.getWorldInfo = function() {
  return {
    "size": {
      w: this.map.size.w * this.gScale,
      h: this.map.size.h * this.gScale,
    },
    "staticItems": this.getSharedStaticItems(),
    "itemsInMap": this.staticItemTypes,
    "background": this.map.background
  };
}

PhysicsEngine.prototype.getSharedStaticItems = function() {
  var shareStaticItems = [];
  var items = this.staticBodies;
  for (var i = 0; i < items.length; i++) {
    var w = items[i];
    shareStaticItems.push(w.getShared());
  };
  return shareStaticItems;
}

// returns point of impact {x, y} or null
PhysicsEngine.prototype.segmentCollideSegment = function(p, r, q, s) {
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
PhysicsEngine.prototype.bulletCollidesBody = function(projectile, B) {
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
PhysicsEngine.prototype.bulletCollideWall = function(projectile) {
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

PhysicsEngine.prototype.bulletCollision = function(projectile) {
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

PhysicsEngine.prototype.checkCollisions = function(body) {
  if (body.collidesWith !== null) {
    return true;
  }
  if (this.outOfWalls(body.addVectors(body, body.UL)) || this.outOfWalls(body.addVectors(body, body.UR)) || this.outOfWalls(body.addVectors(body, body.BL)) || this.outOfWalls(body.addVectors(body, body.BR))) {
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

PhysicsEngine.prototype.step = function() {

  var A, AID;
  for (AID in this.bodies) {
    A = this.bodies[AID];
    if (A.isStatic === false) {
      A.resetCollisions();
    }
  }
  for (AID in this.bodies) {
    A = this.bodies[AID];

    if (A.isStatic === false) {
      if (this.moveToPosition !== null) {
        A.doMove();
      }

    }
  }
  this.destroyBodies();
};


PhysicsEngine.prototype.getShared = function() {
  var bodies = [];
  for (var bID in this.bodies) {
    var body = this.bodies[bID];
    bodies.push(body.getShared());
  }
  return bodies;
}

PhysicsEngine.prototype.destroy = function() {
  this.bodies = null;
  this.size = null;
};

PhysicsEngine.prototype.addBody = function(body) {
  this.bodies[body.id] = body;
}

PhysicsEngine.prototype.createBody = function(position, size, name) {
  var b, id;
  b = new PhysicalBody();
  b.initialize(this, position, size);
  if (!KLib.isUndefined(name)) {
    b.name = name;
  }
  this.bodies[b.id] = b;
  id = b.id;
  b = null;
  return id;
};

PhysicsEngine.prototype.loadStaticItems = function() {
  var b;
  var staticItems = this.map.staticItems.concat([{
    name: 'outsideWall'
  }]);
  this.staticBodies = [];
  var itemsDir = CONFIG.serverPath + '/public/items/';
  for (var i = 0; i < staticItems.length; i++) {
    var item = staticItems[i];
    var itemJSONPath = itemsDir + item.name + '.json';
    var itemJSONString = fs.readFileSync(itemJSONPath);
    var itemJSON = JSON.parse(itemJSONString);
    if (item.name === 'outsideWall') {
      var wallThickness = 1;
      var id;
      id = this.createBody({ x: this.map.size.w / 2, y: this.map.size.h + wallThickness / 2 }, { w: this.map.size.w, h: wallThickness }, 'wallTop');
      b = this.bodies[id];
      b.isStatic = true;
      this.staticBodies.push(b);
      id = this.createBody({ x: -wallThickness / 2, y: this.map.size.h / 2 }, { w: wallThickness, h: this.map.size.h }, 'wallLeft');
      b = this.bodies[id];
      b.isStatic = true;
      this.staticBodies.push(b);
      id = this.createBody({ x: this.map.size.w  + wallThickness / 2, y: this.map.size.h / 2 }, { w: wallThickness, h: this.map.size.h }, 'wallRight');
      b = this.bodies[id];
      b.isStatic = true;
      this.staticBodies.push(b);
      id = this.createBody({ x: this.map.size.w / 2, y: -wallThickness / 2 }, { w: this.map.size.w, h: wallThickness }, 'wallBottom');
      b = this.bodies[id];
      b.isStatic = true;
      this.staticBodies.push(b);
    } else {
      var id = this.createBody(item.position, item.size, item.name);
      b = this.bodies[id];
      b.isStatic = true;
      this.staticBodies.push(b);
    }
    if (this.staticItemTypes[itemJSON.name] == undefined) {
      this.staticItemTypes[itemJSON.name] = itemJSON;
    }
  };
}

module.exports = PhysicsEngine;
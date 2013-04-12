var fs = require('fs');
var KarmaPhysicalBody = require('./KarmaPhysicalBody');
var KLib = require('./../KLib');

var G_bodyID = 0;
var KarmaPhysicsEngine = function(size, map) {
    this.shareCollisionInfo = false;
    this.itemsToDestroy = [];
    this.gScale = 32;
    this.bodies = {};
    this.staticItemTypes = {};
    this.map = map;
    this.setupWorld(size);
    this.loadStaticItems();
  }

KarmaPhysicsEngine.prototype.destroyBodies = function() {
  for(var i in this.itemsToDestroy) {
    var item = this.itemsToDestroy[i];
    item.destroy();
    delete this.bodies[item.id];
  }
  this.itemsToDestroy = [];
};


KarmaPhysicsEngine.prototype.setupWorld = function(size) {
  this.size = size;
};

KarmaPhysicsEngine.prototype.projection = function(corner, axis, name) {
  var res = (corner.x * axis.x + corner.y * axis.y) / (axis.x * axis.x + axis.y * axis.y);
  var p = {
    x: res * axis.x,
    y: res * axis.y
  };

  p.name = name;
  return p;
};

KarmaPhysicsEngine.prototype.projectionWithTranslate = function(base_vector, corner, axis, name) {
  var pointTranslated = {
    x: corner.x - base_vector.x,
    y: corner.y - base_vector.y
  }
  var res = (pointTranslated.x * axis.x + pointTranslated.y * axis.y) / (axis.x * axis.x + axis.y * axis.y);
  var p = {
    x: res * axis.x,
    y: res * axis.y
  };

  p.name = name;
  return p;
};

KarmaPhysicsEngine.prototype.scalarValue = function(v1, v2) {
  return v1.x * v2.x + v1.y * v2.y;
};


function translate(p, v) {
  return {
    x: p.x + v.x,
    y: p.y + v.y
  }
}

function compareScalar(c1, c2) {
  return c1.scalar - c2.scalar;
}

KarmaPhysicsEngine.prototype.axisCollideCheck = function(axis, A, B, axisIndex) {
  var deltaBA = {
    x: B.x - A.x,
    y: B.y - A.y
  };

  A.bUL = translate(B.UL(), deltaBA);
  A.bUL.name = A.playerName + '.bUL';
  A.bUR = translate(B.UR(), deltaBA);
  A.bUR.name = A.playerName + '.bUR';
  A.bBL = translate(B.BL(), deltaBA);
  A.bBL.name = A.playerName + '.bBL';
  A.bBR = translate(B.BR(), deltaBA);
  A.bBR.name = A.playerName + '.bBR';

  var bProjectionUL = this.projection(A.bUL, axis, A.playerName + 'bUL');
  var bProjectionUR = this.projection(A.bUR, axis, A.playerName + 'bUR');
  var bProjectionBL = this.projection(A.bBL, axis, A.playerName + 'bBL');
  var bProjectionBR = this.projection(A.bBR, axis, A.playerName + 'bBR');

  var bULValue = this.scalarValue(bProjectionUL, axis);
  var bURValue = this.scalarValue(bProjectionUR, axis);
  var bBLValue = this.scalarValue(bProjectionBL, axis);
  var bBRValue = this.scalarValue(bProjectionBR, axis);

  var aProjections;
  if(axisIndex == 1 || axisIndex == 2) {
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
    scalar: this.scalarValue(bProjectionBL, axis),
    p: bProjectionBL
  });
  bProjections.push({
    scalar: this.scalarValue(bProjectionBR, axis),
    p: bProjectionBR
  });
  bProjections.push({
    scalar: this.scalarValue(bProjectionUL, axis),
    p: bProjectionUL
  });
  bProjections.push({
    scalar: this.scalarValue(bProjectionUR, axis),
    p: bProjectionUR
  });

  var aSorted = aProjections.sort(compareScalar);
  var minA = aSorted[0].scalar;
  var maxA = aSorted[3].scalar;


  var bSorted = bProjections.sort(compareScalar);
  var minB = bSorted[0].scalar;
  var maxB = bSorted[3].scalar;

  if(this.shareCollisionInfo) {
    A.axesMinMax[axisIndex] = {
      minA: aSorted[0],
      maxA: aSorted[3],
      minB: bSorted[0],
      maxB: bSorted[3]
    };
  }

  if(minA < minB) {
    if(minB <= maxA) {
      return true;
    }
  } else {
    if(minA <= maxB) {
      return true;
    }
  }

  return false;
};

function myRotate(p, r) {
  return {
    x: p.x * Math.cos(r) - p.y * Math.sin(r),
    y: p.x * Math.sin(r) + p.y * Math.cos(r)
  }
}

KarmaPhysicsEngine.prototype.collideTest = function(A, B) {
  if(A.id === B.id) {
    return false;
  }
  var radiusSum = A.radius + B.radius;
  if(Math.abs(A.x - B.x) >= radiusSum || Math.abs(A.y - B.y) >= radiusSum) {
    return false;
  }
  var axes = [A.a1, A.a2, B.a1, B.a2];
  var collides = true;
  A.axesMinMax = {};
  for(var i = 0; i < axes.length; i++) {
    var axis = axes[i];
    if(!this.axisCollideCheck(axis, A, B, i + 1)) {
      collides = false;
      break;
    }
  };
  return collides;
};

KarmaPhysicsEngine.prototype.outOfWalls = function(point) {
  var res = point.x < 0 || point.y < 0 || point.x > this.map.size.w || point.y > this.map.size.h
  return res;
}



KarmaPhysicsEngine.prototype.getWorldInfo = function() {
  return {
    "size": {
      w: this.map.size.w * this.gScale,
      h: this.map.size.h * this.gScale,
    },
    "staticItems": this.getShareStaticItems(),
    "itemsInMap": this.staticItemTypes,
    "background": this.map.background
  };
}
KarmaPhysicsEngine.prototype.getShareStaticItems = function() {
  var shareStaticItems = [];
  var items = this.staticBodies;
  // return shareStaticItems;
  for(var i = 0; i < items.length; i++) {
    var w = items[i];
    shareStaticItems.push(w.getShared());
  };
  return shareStaticItems;
}

KarmaPhysicsEngine.prototype.getLine = function(p1, p2) {
  var l = {};
  l.A = p2.y - p1.y;
  l.B = p1.x - p2.x;
  l.C = l.A * p1.x - l.B * p1.y;
  return l;
};

//http://community.topcoder.com/tc?module=Static&d1=tutorials&d2=geometry2
KarmaPhysicsEngine.prototype.lineIntersectLine = function(line1, line2) {
  var det = line1.A * line2.B - line2.A * line1.B
  if(det == 0) {
    //Lines are parallel
    return null;
  } else {
    var p = {};
    p.x = ((line2.B * line1.C) - (line1.B * line2.C)) / det;
    p.y = ((line1.A * line2.C) - (line2.A * line1.C)) / det;
    p.x = Math.abs(p.x);
    p.y = Math.abs(p.y);
    return p;
  }
};


KarmaPhysicsEngine.prototype.getVector = function(p1, p2) {
  return {
    x: p2.x - p1.x,
    y: p2.y - p1.y
  };
}

KarmaPhysicsEngine.prototype.vectorCrossProduct = function(v, w) {
  return v.x * w.y - v.y * w.x
}

// http://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
KarmaPhysicsEngine.prototype.segmentCollideSegment = function(p, r, q, s) {
  var r_times_s = this.vectorCrossProduct(r, s);
  if(r_times_s === 0) {
    // segments are parallel
    return null;
  }

  var q_minus_p = {
    x: q.x - p.x,
    y: q.y - p.y
  };
  var t = this.vectorCrossProduct(q_minus_p, s) / r_times_s;

  if(t < 0 || t > 1) {
    // on the line but out of segment
    return null;
  }
  var u = this.vectorCrossProduct(q_minus_p, r) / r_times_s;
  if(u < 0 || u > 1) {
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

KarmaPhysicsEngine.prototype.bulletCollideBody = function(projectile, B) {
  var pBullet = projectile.pBullet,
      vBullet = projectile.vBullet;

  var UL = B.UL();
  var UR = B.UR();
  var BL = B.BL();
  var BR = B.BR();

  var p1 = translate(UL, B);
  var p2 = translate(UR, B);
  var p3 = translate(BR, B);
  var p4 = translate(BL, B);

  var v1 = this.getVector(UL, UR);
  var v2 = this.getVector(UR, BR);
  var v3 = this.getVector(BR, BL);
  var v4 = this.getVector(BL, UL);
  var i1 = this.segmentCollideSegment(pBullet, vBullet, p1, v1);
  var i2 = this.segmentCollideSegment(pBullet, vBullet, p2, v2);
  var i3 = this.segmentCollideSegment(pBullet, vBullet, p3, v3);
  var i4 = this.segmentCollideSegment(pBullet, vBullet, p4, v4);

  var points = [i1, i2, i3, i4];
  var res = [];
  for(var i in points) {
    if(points[i] !== null) {
      res.push(points[i])
    }
  }
  return res
};

KarmaPhysicsEngine.prototype.bulletCollideWall = function(projectile) {
  var pBullet = projectile.pBullet,
      vBullet = projectile.vBullet;

  var getWall = function(px, py, vx, vy) {
    return {
      p :{ x: px,y: py},
      v :{ x: vx,  y: vy}
    };
  }
  var walls = [];
  walls.push(getWall(0, 0, this.map.size.w, 0));
  walls.push(getWall(0, 0, 0,this.map.size.h));
  walls.push(getWall(this.map.size.w, this.map.size.h, -this.map.size.w,0));
  walls.push(getWall(this.map.size.w, this.map.size.h, 0,-this.map.size.h));


  for (var i=0; i < walls.length; i++) {
    var w = walls[i];
    var collide = this.segmentCollideSegment(pBullet, vBullet, w.p, w.v);
    if (collide !== null) {
      return collide;
    }
  }
  return null;
}

KarmaPhysicsEngine.prototype.bulletCollision = function(projectile) {
  var pointsAndBullets = [];
  for(var bID in this.bodies) {
    var B = this.bodies[bID];
    if(projectile.playerCar.car.id === B.id) {
      continue;
    }
    if(!KLib.isUndefined(B.playerCar) && B.playerCar.dead === true) {
      continue;
    }
    var _points = this.bulletCollideBody(projectile, B);
    for (var i = 0; i < _points.length; i++) {
      var p = _points[i];
      pointsAndBullets.push({
        body:B,
        point:p
      });
    };
  }
  pointsAndBullets.push({
    body: { name: 'outsideWall' },
    point: this.bulletCollideWall(projectile)
  });
  return this.getClosestPoint(projectile, pointsAndBullets);
};


KarmaPhysicsEngine.prototype.getClosestPoint = function(source, points) {

  function getScore(source, p) {
    return Math.abs(source.x - p.x) * Math.abs(source.y - p.y);
  }

  var twins = [];
  for(var i = 0; i < points.length; i++) {
    var pointAndBody = points[i];
    var point = pointAndBody.point;
    if(point !== null) {
      twins.push({
        score: getScore(source, point),
        point: point,
        body : pointAndBody.body
      });
    }
  };
  if(twins.length == 0) {
    return null;
  }
  var sorted = twins.sort(function(a, b) {
    return a.score - b.score;
  });

  return sorted[0];
}


KarmaPhysicsEngine.prototype.checkCollisions = function(body) {
  if(body.collidesWith !== null) {
    return true;
  }
  if(this.outOfWalls(body.addVectors(body, body.UL())) || this.outOfWalls(body.addVectors(body, body.UR())) || this.outOfWalls(body.addVectors(body, body.BL())) || this.outOfWalls(body.addVectors(body, body.BR()))) {
    body.collidesWith = {
      name: 'outsideWall',
      isStatic: true
    };
    return true;
  }
  var A = body;
  for(var b2ID in this.bodies) {
    if(b2ID !== A.id) {
      var B = this.bodies[b2ID];
      if(!KLib.isUndefined(B.playerCar) && B.playerCar.dead === true) {
        continue;
      }
      if(this.collideTest(A, B)) {
        A.collidesWith = this.bodies[B.id];
        B.collidesWith = A;
        return true;
      } else {}
    }
  }

  return false;
}

KarmaPhysicsEngine.prototype.step = function() {

  var A, AID;
  for(AID in this.bodies) {
    A = this.bodies[AID];
    if(A.isStatic === false) {
      A.resetCollisions();
    }
  }
  for(AID in this.bodies) {
    A = this.bodies[AID];
    if(A.isStatic === false) {
      A.doMove();
    }
  }
  this.destroyBodies();
};


KarmaPhysicsEngine.prototype.getShared = function() {
  var bodies = [];
  for(var bID in this.bodies) {
    var body = this.bodies[bID];
    bodies.push(body.getShared());
  }
  return bodies;
}


KarmaPhysicsEngine.prototype.destroy = function() {
  this.bodies = null;
  this.size = null;
};

KarmaPhysicsEngine.prototype.addBody = function(body) {
  this.bodies[body.id] = body;
}

KarmaPhysicsEngine.prototype.createBody = function(position, size, name) {
  var b, id;
  b = new KarmaPhysicalBody();
  b.initialize(this, position, size);
  if(!KLib.isUndefined(name)) {
    b.name = name;
  }
  this.bodies[b.id] = b;
  id = b.id;
  b = null;
  return id;
};

KarmaPhysicsEngine.prototype.loadStaticItems = function() {
  var b;
  var staticItems = this.map.staticItems.concat([{
    name: 'outsideWall'
  }]);
  this.staticBodies = [];
  var itemsDir = __dirname + '/../../public/items/';
  for(var i = 0; i < staticItems.length; i++) {
    var item = staticItems[i];
    var itemJSONPath = itemsDir + item.name + '.json';
    var itemJSONString = fs.readFileSync(itemJSONPath);
    var itemJSON = JSON.parse(itemJSONString);
    if(item.name !== 'outsideWall') {
      var id = this.createBody(item.position, item.size, item.name);
      b = this.bodies[id];
      b.isStatic = true;
      this.staticBodies.push(b);
    }
    if(this.staticItemTypes[itemJSON.name] == undefined) {
      this.staticItemTypes[itemJSON.name] = itemJSON;
    }
  };
}

module.exports = KarmaPhysicsEngine;

// KarmaPhysicsEngine = null;
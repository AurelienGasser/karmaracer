var KarmaPhysicalBody = require('./KarmaPhysicalBody');

var G_bodyID = 0;
var KarmaPhysicsEngine = function(size) {
    this.gScale = 1;
    this.bodies = {};
    this.setupWorld(size);
  }


KarmaPhysicsEngine.prototype.setupWorld = function(size) {
  this.size = size;

  var b = this.createBody({
    'x': 10,
    'y': 10
  }, {
    'w': 2,
    'h': 2
  });
};
KarmaPhysicsEngine.prototype.projection = function(corner, axis, name) {
  // console.log('corner', corner, Math.pow(axis.x,2));
  var res = (corner.x * axis.x + corner.y * axis.y) / (axis.x * axis.x + axis.y * axis.y);
  // console.log('res', res, corner,axis);
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
  // console.log('corner', corner, Math.pow(axis.x,2));
  var res = (pointTranslated.x * axis.x + pointTranslated.y * axis.y) / (axis.x * axis.x + axis.y * axis.y);
  // console.log('res', res, corner,axis);
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

  var aProjectionUL = this.projection(A.UL(), axis, A.playerName + 'aUL');
  var aProjectionUR = this.projection(A.UR(), axis, A.playerName + 'aUR');
  var aProjectionBL = this.projection(A.BL(), axis, A.playerName + 'aBL');
  var aProjectionBR = this.projection(A.BR(), axis, A.playerName + 'aBR');
  var bProjectionUL = this.projection(A.bUL, axis, A.playerName + 'bUL');
  var bProjectionUR = this.projection(A.bUR, axis, A.playerName + 'bUR');
  var bProjectionBL = this.projection(A.bBL, axis, A.playerName + 'bBL');
  var bProjectionBR = this.projection(A.bBR, axis, A.playerName + 'bBR');

  var aULValue = this.scalarValue(aProjectionUL, axis);
  var aURValue = this.scalarValue(aProjectionUR, axis);
  var aBLValue = this.scalarValue(aProjectionBL, axis);
  var aBRValue = this.scalarValue(aProjectionBR, axis);

  var bULValue = this.scalarValue(bProjectionUL, axis);
  var bURValue = this.scalarValue(bProjectionUR, axis);
  var bBLValue = this.scalarValue(bProjectionBL, axis);
  var bBRValue = this.scalarValue(bProjectionBR, axis);

  A.p1 = aProjectionUL;
  A.p2 = aProjectionUR;
  A.p3 = aProjectionBL;
  A.p4 = aProjectionBR;

  A.p5 = bProjectionUL;
  A.p6 = bProjectionUR;
  A.p7 = bProjectionBL;
  A.p8 = bProjectionBR;

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

  A.axesMinMax[axisIndex] = {
   minA: aSorted[0],
   maxA: aSorted[3],
   minB: bSorted[0],
   maxB: bSorted[3]
  };

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

function myRotate(p, r) {
  return {
    x: p.x * Math.cos(r) - p.y * Math.sin(r),
    y: p.x * Math.sin(r) + p.y * Math.cos(r)
  }
}

KarmaPhysicsEngine.prototype.collideTest = function(A, B) {
  if(A.id === B.id) {
    return;
  }
  var a1 = A.axis1();
  var a2 = A.axis2();
  var a3 = B.axis1();
  var a4 = B.axis2();

  A.a1 = a1;
  A.a2 = a2;
  A.a3 = a3;
  A.a4 = a4;

  var axes = [a1, a2, a3, a4];

  var collide = true;
  A.axesMinMax = {};
  for(var i = 0; i < axes.length; i++) {
    var axis = axes[i];
    if(!this.axisCollideCheck(axis, A, B, i + 1)) {
      collide = false;
      // break;
    }
  };
  if(collide) {
    console.log('collision between', A.id, 'and', B.id)
    A.collides = true;
    B.collides = true;
  }
};

KarmaPhysicsEngine.prototype.step = function() {
  for(var b1ID in this.bodies) {
    var b = this.bodies[b1ID];
    b.collides = false;
  }
  for(var b1ID in this.bodies) {
    var b1 = this.bodies[b1ID];
    var found = false;
    for(var b2ID in this.bodies) {
      if (!found) {
        if (b2ID == b1ID) {
          found = true;
        }
        continue;
      } else {
        var b2 = this.bodies[b2ID];
        this.collideTest(b1, b2)
      }
    }
    b1.step();
  }
  for(var b1ID in this.bodies) {
    var b = this.bodies[b1ID];
    if (b.collides) {
      b.color = '#F00';
    } else {
      b.color = '#FFF';
    }
  }
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
  body.id = Math.random(); // maintain id integrity
  this.bodies[body.id] = body;
}

KarmaPhysicsEngine.prototype.createBody = function(position, size) {
  position.x *= this.gScale;
  position.y *= this.gScale;
  size.w *= this.gScale;
  size.h *= this.gScale;
  var b = new KarmaPhysicalBody();
  b.initialize(position, size);
  this.bodies[b.id] = b;
  b = null;
};

module.exports = KarmaPhysicsEngine;

// KarmaPhysicsEngine = null;
var KarmaPhysicsEngineBody = require('./KarmaPhysicsEngineBody');

var G_bodyID = 0;
var KarmaPhysicsEngine = function(size) {
    this.gScale = 1;
    this.bodies = {};
    this.setupWorld(size);
  }


KarmaPhysicsEngine.prototype.setupWorld = function(size) {
  this.size = size;

  var a = this.createBody({
    'x': 8,
    'y': 8
  }, {
    'w': 1,
    'h': 1
  });

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


KarmaPhysicsEngine.prototype.collide = function(A, B) {
  A.color = '#FF0000';
  B.color = '#FF0000';
};

function translate(p, v) {
  return {
    x: p.x + v.x,
    y: p.y + v.y
  }
}

KarmaPhysicsEngine.prototype.axisCollideCheck = function(axis, A, B) {
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

  var aProjection1 = this.projection(A.UL(), axis, A.playerName + 'aUL');
  var aProjection2 = this.projection(A.UR(), axis, A.playerName + 'aUR');
  var bProjectionUL = this.projection(A.bUL, axis, A.playerName + 'bUL');
  var bProjectionUR = this.projection(A.bUR, axis, A.playerName + 'bUR');
  var bProjectionBL = this.projection(A.bBL, axis, A.playerName + 'bBL');
  var bProjectionBR = this.projection(A.bBR, axis, A.playerName + 'bBR');
  // A.p2 = A.rotate(aProjection2.x, aProjection2.y);
  // A.p2.name = aProjection2.name;
  // A.p2.x += A.UR().x;
  // A.p2.y += A.UR().y;
  // console.log(A.p2);
  var a1Value = this.scalarValue(aProjection1, axis);
  var a2Value = this.scalarValue(aProjection2, axis);
  var bBLValue = this.scalarValue(bProjectionBL, axis);
  var bBRValue = this.scalarValue(bProjectionBR, axis);
  var bULValue = this.scalarValue(bProjectionUL, axis);
  var bURValue = this.scalarValue(bProjectionUR, axis);
  A.p1 = aProjection1;
  A.p2 = aProjection2;
  A.p3 = bProjectionUL;
  A.p4 = bProjectionUR;
  A.p5 = bProjectionBL;
  A.p6 = bProjectionBR;

  var aProjections = [];
  aProjections.push({
    scalar: a1Value,
    p: aProjection1
  });
  aProjections.push({
    scalar: a2Value,
    p: aProjection2
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



  var compareScalar = function(c1, c2) {
    return c1.scalar - c2.scalar;
  }


  var aSorted = aProjections.sort(compareScalar);
  var minA = aSorted[0].scalar;
  var maxA = aSorted[1].scalar;

  A.minA = aSorted[0];
  A.maxA = aSorted[1];



  var bSorted = bProjections.sort(compareScalar);
  var minB = bSorted[0].scalar;
  var maxB = bSorted[3].scalar;

  A.minB = bSorted[0];
  A.maxB = bSorted[3];


  // console.log(minA, minB, maxA, maxB);
  // // console.log('a', minA, maxA);
  // // console.log('b',minB, maxB);
  if(minB <= maxA) {
    console.log('case 1', A.id, B.id);
    return true;
  }
  if(maxB <= minA) {
    console.log('case 2', A.id, B.id);
    return true;
  }
  // 
  // B.r += rASave;
  // A.r = rASave;
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
  var axes = [
  A.axis1()]
  // var axis = A.axis1();
  // if (A.x < B.x) {
  //   this.axisCollideCheck(axis, axisCenter, B, A);    
  // } else {
  // this.axisCollideCheck(axis, A, B);
  // }
  var collide = false;
  for(var i = 0; i < axes.length; i++) {
    var axis = axes[i];
    if(this.axisCollideCheck(axis, A, B)) {
      collide = true;
      break;
    }
  };
  if(collide) {
    // A.color = '#000';
    // B.color = '#000';
    this.collide(A, B);
  } else {
    A.color = '#FFF';
    B.color = '#FFF';
  }
};

KarmaPhysicsEngine.prototype.step = function() {



  for(var b1ID in this.bodies) {
    var b1 = this.bodies[b1ID];

    b1.step();

    // for(var b2ID in this.bodies) {
    //   var b2 = this.bodies[b2ID];
    //   if (b2.x >= b1.x){
    //     this.collideTest(b1, b2);  
    //   }
      
    // }
  }

    this.collideTest(this.bodies[0], this.bodies[1]);  
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

KarmaPhysicsEngine.prototype.createBody = function(position, size) {
  position.x *= this.gScale;
  position.y *= this.gScale;
  size.w *= this.gScale;
  size.h *= this.gScale;
  var b = new KarmaPhysicsEngineBody(position, size);
  this.bodies[b.id] = b;
  b = null;
};

module.exports = KarmaPhysicsEngine;

// KarmaPhysicsEngine = null;
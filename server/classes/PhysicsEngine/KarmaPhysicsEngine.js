var fs = require('fs');
var KarmaPhysicalBody = require('./KarmaPhysicalBody');
var KLib = require('./../KLib');

var G_bodyID = 0;
var KarmaPhysicsEngine = function(size, map) {
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

  var collides = true;
  A.axesMinMax = {};
  for(var i = 0; i < axes.length; i++) {
    var axis = axes[i];
    if(!this.axisCollideCheck(axis, A, B, i + 1)) {
      collides = false;
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


KarmaPhysicsEngine.prototype.recheckCollisions = function(body) {
  if(this.outOfWalls(body.addVectors(body, body.UL())) || this.outOfWalls(body.addVectors(body, body.UR())) || this.outOfWalls(body.addVectors(body, body.BL())) || this.outOfWalls(body.addVectors(body, body.BR()))) {
    body.collidesWith = {
      name: 'outsideWall',
      isStatic: true
    };
    return true;
  }
  var A = body;
  A.collidesWith = null;
  for(var b2ID in this.bodies) {
    if(b2ID != A.id) {
      var B = this.bodies[b2ID];
      if(this.collideTest(A, B)) {
        // console.log('collision between', A.id, 'and', B.id)
        A.collidesWith = this.bodies[B.id];
        // B.collidesWith = A.id;
        return true;
      } else {
        // B.collidesWith = null;
      }
    }
  }
  return false;
}

KarmaPhysicsEngine.prototype.step = function() {
  for(var b1ID in this.bodies) {
    var b1 = this.bodies[b1ID];
    b1.step();
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
  body.id = Math.random(); // maintain id integrity
  this.bodies[body.id] = body;
}

KarmaPhysicsEngine.prototype.createBody = function(position, size, name) {
  var b, id;
  b = new KarmaPhysicalBody();
  b.initialize(this, position, size);
  if (!KLib.isUndefined(name)){
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

  console.log(this.staticBodies.length);
}

module.exports = KarmaPhysicsEngine;

// KarmaPhysicsEngine = null;
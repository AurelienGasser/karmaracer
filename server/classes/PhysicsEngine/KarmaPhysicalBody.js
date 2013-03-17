var KLib = require('./../KLib');
var G_bodyID = 0;

var KarmaPhysicalBody = function() {
    return this;
  }

KarmaPhysicalBody.prototype.initialize = function(engine, position, size) {
  this.engine = engine;
  this.gScale = this.engine.gScale;
  this.id = G_bodyID++;
  this.x = position.x;
  this.y = position.y;
  this.w = size.w;
  this.h = size.h;
  this.r = 0;
  this.playerName = 'b' + this.id;
  this.name = 'body';
  this.s = 0;
  this.l = 0;
  this.wDiv2 = this.w / 2;
  this.hDiv2 = this.h / 2;
  this.color = '#FFF';
  this.collidesWith = null;
  this.updateCornerCache();
  this.isStatic = false;
  this.isBullet = false;
}

KarmaPhysicalBody.prototype.accelerate = function(ac) {
  var newpos = {
    x: this.x + ac * Math.cos(this.r),
    y: this.y + ac * Math.sin(this.r)
  };
  this.moveTo(newpos);
}

KarmaPhysicalBody.prototype.step = function() {
  this.collidesWith = null;
};

KarmaPhysicalBody.prototype.scheduleForDestroy = function() {
  this.engine.itemsToDestroy.push(this);
}

KarmaPhysicalBody.prototype.destroy = function() {
  this.engine = null;
}

KarmaPhysicalBody.prototype.getPosition = function() {
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

KarmaPhysicalBody.prototype.addVectors = function(a, b) {
  return {
    x: a.x + b.x,
    y: a.y + b.y
  }
}

KarmaPhysicalBody.prototype.getVector = function(power, angle) {
  if(!angle) {
    angle = 0;
  }
  angle += this.r;
  var v = {
    x: power.x * Math.cos(angle),
    y: power.y * Math.sin(angle)
  };
  return v;
}

KarmaPhysicalBody.prototype.addAngle = function(a) {
  this.moveTo({
    r: (this.r + a) % (Math.PI * 2)
  })
}

KarmaPhysicalBody.prototype.turn = function(side) {
  var angleToAdd = side * Math.PI / 2;
  this.addAngle(angleToAdd);
}

KarmaPhysicalBody.prototype.setPosition = function(data) {
  if(typeof data.x != 'undefined') {
    this.x = data.x;
  }
  if(typeof data.y != 'undefined') {
    this.y = data.y;
  }
  if(typeof data.r != 'undefined') {
    this.r = data.r;
  }
}

// returns true if to position doesn't create any collision
KarmaPhysicalBody.prototype.tryPosition = function(to) {
  var old = {
    x: this.x,
    y: this.y,
    r: this.r
  };
  this.setPosition(to);
  this.updateCornerCache();
  var res = !this.engine.recheckCollisions(this);

  this.setPosition(old);
  this.updateCornerCache();
  this.engine.recheckCollisions(this);
  return res;
}

function getMiddle(from, to) {
  var res = {}
  if(typeof to.x != 'undefined') {
    res.x = (to.x + from.x) / 2;
  }
  if(typeof to.y != 'undefined') {
    res.y = (to.y + from.y) / 2;
  }
  if(typeof to.r != 'undefined') {
    res.r = (to.r + from.r) / 2;
  }
  return res;
}

function positive(x) {
  return x > 0 ? x : -x;
}

function getDistance(from, to) {
  var res = 0;
  if(typeof to.x != 'undefined') {
    res += positive(to.x - from.x);
  }
  if(typeof to.y != 'undefined') {
    res += positive(to.y - from.y);
  }
  if(typeof to.r != 'undefined') {
    res += positive(to.r - from.r);
  }
  return res;
}

var COLLISION_DISTANCE_TRESHOLD = 0.0000001;

KarmaPhysicalBody.prototype.moveToDichotomie = function(from, to) {
  if(this.tryPosition(to) === false) {
    while(this.tryPosition(from) || this.tryPosition(to)) {
      var distance = getDistance(from, to);
      if(distance < COLLISION_DISTANCE_TRESHOLD) {
        return from;
      } else {
        var mid = getMiddle(from, to);
        if(this.tryPosition(mid)) {
          from = mid;
        } else {
          to = mid;
        }
      }
    }
    return false; // should never happen
  } else {
    return to;
  }
}

KarmaPhysicalBody.prototype.getNumCollisions = function() {
  var res = 0;
  for(var i in this.collidesWith) {
    ++res;
  }
  return res;
}

KarmaPhysicalBody.prototype.getPosFriction = function(_old, _new, angle, forward) {
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

KarmaPhysicalBody.prototype.getPositionsWithFriction = function(_old, _new) {
  return [, this.getPosFriction(_old, _new, 0.1, 0.25), this.getPosFriction(_old, _new, 0.05, 0.115), this.getPosFriction(_old, _new, 0.0001, 0), this.getPosFriction(_old, _new, -0.1, 0.25), this.getPosFriction(_old, _new, -0.05, 0.115), this.getPosFriction(_old, _new, -0.0001, 0)];
}

KarmaPhysicalBody.prototype.tryDriftAgainstWall = function(_old, _new) {
  var positionsWithFriction = this.getPositionsWithFriction(_old, _new);
  for(var i in positionsWithFriction) {
    var pos = positionsWithFriction[i];
    if(this.tryPosition(pos)) {
      return pos;
    }
  }
  return null;
}




KarmaPhysicalBody.prototype.moveTo = function(pos) {
  var old = {
    x: this.x,
    y: this.y,
    r: this.r
  };
  if(KLib.isUndefined(pos.x)) {
    pos.x = this.x;
  }
  if(KLib.isUndefined(pos.y)) {
    pos.y = this.y;
  }
  if(KLib.isUndefined(pos.r)) {
    pos.r = this.r;
  }
  this.setPosition(pos);
  this.updateCornerCache();

  var res = this.engine.recheckCollisions(this);
  if(res) {
    if(this.isBullet === true) {
      this.explode();
      if (this.collidesWith.name === 'car'){
        var playerCar = this.collidesWith.playerCar;
        playerCar.gameServer.carManager.projectileHitCar(this.playerCar, playerCar, this);
      }
      return;
    }
    if(this.collidesWith.isStatic === true) {
      this.x = old.x;
      this.y = old.y;
    } else {
      this.setPosition(old);
    }
    this.updateCornerCache();
  }
  return;


  // if (this.getNumCollisions() == 0) {
  //   var newPos = this.moveToDichotomie(old, pos);
  //   this.setPosition(newPos) // finally set the position and update collision status / corners
  //   var dist = getDistance(pos, newPos)
  //   if (getDistance(old, newPos) > COLLISION_DISTANCE_TRESHOLD) {
  //     return true;
  //   } else if (typeof pos.r == 'undefined') {
  //     // var driftPos = this.tryDriftAgainstWall(old, pos);
  //     // if (driftPos) {
  //     //   this.setPosition(driftPos);
  //       return true;
  //     // } else {
  //     //   return false;
  //     // }
  //   } else {
  //     return false;
  //   }
  // } else {
  //   return false;
  // }
}

KarmaPhysicalBody.prototype.cosWidthDiv2 = function() {
  return Math.cos(this.r) * this.wDiv2;
};

KarmaPhysicalBody.prototype.sinHeightDiv2 = function() {
  return Math.cos(this.r) * this.wDiv2;
};

KarmaPhysicalBody.prototype.rotate = function(x, y) {
  return {
    x: x * Math.cos(this.r) - y * Math.sin(this.r),
    y: x * Math.sin(this.r) + y * Math.cos(this.r)
  }
}

KarmaPhysicalBody.prototype.translate = function(coord) {
  return {
    x: coord.x + this.x,
    y: coord.y + this.y
  };
};

KarmaPhysicalBody.prototype.getCorners = function() {
  return [
  this.rotate(+this.wDiv2, +this.hDiv2), this.rotate(-this.wDiv2, +this.hDiv2), this.rotate(+this.wDiv2, -this.hDiv2), this.rotate(-this.wDiv2, -this.hDiv2)]
};

var compareY = function(c1, c2) {
    return c2.y - c1.y;
  }

var compareX = function(c1, c2) {
    return c2.x - c1.x;
  }

KarmaPhysicalBody.prototype.updateCornerCache = function() {
  this.corners = this.getCorners();
};

KarmaPhysicalBody.prototype.UR = function() {
  var maxY = this.corners.sort(compareY);
  var maxX = maxY.slice(0, 2).sort(compareX);
  return maxX[0];
};

KarmaPhysicalBody.prototype.UL = function() {
  var minY = this.corners.sort(compareY);
  var maxX = minY.slice(0, 2).sort(compareX);
  return maxX[1];
};

KarmaPhysicalBody.prototype.BR = function() {
  var minY = this.corners.sort(compareY).reverse();
  var maxX = minY.slice(0, 2).sort(compareX);
  return maxX[0];
};

KarmaPhysicalBody.prototype.BL = function() {
  var minY = this.corners.sort(compareY).reverse();
  var maxX = minY.slice(0, 2).sort(compareX);
  return maxX[1];
};

KarmaPhysicalBody.prototype.axis1 = function() {
  var ur = this.UR();
  var ul = this.UL();
  var a1 = {
    x: ur.x - ul.x,
    y: ur.y - ul.y
  };
  if(a1.x < 0) {
    a1 = {
      x: -a1.x,
      y: -a1.y
    }
  }
  return a1;
};

KarmaPhysicalBody.prototype.axis2 = function() {
  var ur = this.translate(this.UR());
  var br = this.translate(this.BR());
  var a2 = {
    x: ur.x - br.x,
    y: ur.y - br.y
  };
  if(a2.x < 0) {
    a2 = {
      x: -a2.x,
      y: -a2.y
    }
  }
  return a2;
};

KarmaPhysicalBody.prototype.scalePoint = function(p) {
  if(!p) {
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

KarmaPhysicalBody.prototype.scalePointAndAddName = function(name, p) {
  var scaled = {
    x: p.x * this.gScale,
    y: p.y * this.gScale
  };
  scaled.name = name;
  return scaled;
};

KarmaPhysicalBody.prototype.scaleAxesMinMax = function(minMax) {
  var res = {}
  var gScale = this.gScale;
  for(var i in minMax) {
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

KarmaPhysicalBody.prototype.getShared = function() {
  var ul = this.UL();
  var ur = this.UR();
  var br = this.BR();
  var bl = this.BL();

  var collides = this.getNumCollisions() > 0;

  var options = {
    x: this.x * this.gScale,
    y: this.y * this.gScale,
    w: this.w * this.gScale,
    h: this.h * this.gScale,
    r: this.r,
    name: this.name,
    playerName: this.playerName,
    s: 0,
    l: 0,
    ul: this.scalePointAndAddName('ul', ul),
    ur: this.scalePointAndAddName('ur', ur),
    bl: this.scalePointAndAddName('bl', bl),
    br: this.scalePointAndAddName('br', br),
    color: collides ? '#F00' : '#FFF'
  };

  if(this.axesMinMax) {
    var collision = {
      a1: this.a1,
      a2: this.a2,
      a3: this.a3,
      a4: this.a4,
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
    options.collision = collision;
  }



  return options;
};

module.exports = KarmaPhysicalBody;
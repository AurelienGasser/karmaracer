var G_bodyID = 0;

var KarmaPhysicalBody = function() {
  return this;
}

KarmaPhysicalBody.prototype.initialize = function(engine, position, size) {
  this.engine = engine;
  this.gScale = 32;
  this.id = G_bodyID++;
  this.x = position.x;
  this.y = position.y;
  this.w = size.w;
  this.h = size.h;
  this.r = 0;
  this.playerName = 'b' + this.id;
  this.name = 'car';
  this.s = 0;
  this.l = 0;
  this.wDiv2 = this.w / 2;
  this.hDiv2 = this.h / 2;
  this.color = '#FFF';
  this.collidesWith = {};
  this.updateCornerCache();
}

KarmaPhysicalBody.prototype.step = function() {
};

KarmaPhysicalBody.prototype.getPosition = function() {
  return {
    x: this.x,
    y: this.y
  };
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
  var angleToAdd = side * Math.PI / 4;
  this.addAngle(angleToAdd);
}

KarmaPhysicalBody.prototype.moveTo = function(pos) {
  var oldx = this.x;
  var oldy = this.y;
  var oldr = this.r;
  if (typeof pos.x != 'undefined') { this.x = pos.x; }
  if (typeof pos.y != 'undefined') { this.y = pos.y; }
  if (typeof pos.r != 'undefined') { this.r = pos.r; }
  this.updateCornerCache();
  if (this.engine.recheckCollisions(this)) {
    this.x = oldx;
    this.y = oldy;
    this.r = oldr;
    // this.updateCornerCache();
  }
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
  if (a1.x < 0) {
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
  if (a2.x < 0) {
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
  // console.log(p);
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

KarmaPhysicalBody.prototype.getShared = function() {
  var ul = this.UL();
  var ur = this.UR();
  var br = this.BR();
  var bl = this.BL();

  var collides = false;
  for (var i in this.collidesWith) {
    collides = true;
    break;
  }

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

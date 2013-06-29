var KLib = require('./../KLib');

var Body_shared = {};

Body_shared.scalePosition = function(p) {
  if (!p) {
    return {
      x: 0,
      y: 0
    }
  }
  var scaled = {
    x: p.x * this.gScale,
    y: p.y * this.gScale,
    r: p.r
  };
  return scaled;
};

Body_shared.scalePoint = function(p) {
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

Body_shared.scalePointAndAddName = function(name, p) {
  var scaled = {
    x: p.x * this.gScale,
    y: p.y * this.gScale
  };
  scaled.name = name;
  return scaled;
};

Body_shared.scaleAxesMinMax = function(minMax) {
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

Body_shared.getShared = function() {

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
    var ul = this.UL;
    var ur = this.UR;
    var br = this.BR;
    var bl = this.BL;
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
  options.lastMove = this.scalePosition(this.lastMove);
  return options;
};

module.exports = Body_shared;
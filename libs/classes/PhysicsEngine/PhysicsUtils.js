var KLib = require('../KLib');
var PhysicsUtils = {}

PhysicsUtils.projection = function(a, b, name) {
  var res = (a.x * b.x + a.y * b.y) / (b.x * b.x + b.y * b.y);
  var p = {
    x: res * b.x,
    y: res * b.y
  };
  if (!KLib.isUndefined(name)) {
    p.name = name;
  }
  return p;
};

PhysicsUtils.scalarValue = function(v1, v2) {
  return v1.x * v2.x + v1.y * v2.y;
};

PhysicsUtils.translate = function(p, v) {
  return {
    x: p.x + v.x,
    y: p.y + v.y
  }
}

PhysicsUtils.getLine = function(p1, p2) {
  var l = {};
  l.A = p2.y - p1.y;
  l.B = p1.x - p2.x;
  l.C = l.A * p1.x - l.B * p1.y;
  return l;
};

//http://community.topcoder.com/tc?module=Static&d1=tutorials&d2=geometry2
PhysicsUtils.lineIntersectLine = function(line1, line2) {
  var det = line1.A * line2.B - line2.A * line1.B
  if (det == 0) {
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

PhysicsUtils.getVector = function(p1, p2) {
  return {
    x: p2.x - p1.x,
    y: p2.y - p1.y
  };
}

PhysicsUtils.vectorCrossProduct = function(v, w) {
  return v.x * w.y - v.y * w.x
}

function getScore(source, p) {
  return Math.abs(source.x - p.x) * Math.abs(source.y - p.y);
}

PhysicsUtils.getClosestPoint = function(source, points) {
  var twins = [];
  for (var i = 0; i < points.length; i++) {
    var pointAndBody = points[i];
    var point = pointAndBody.point;
    if (point !== null) {
      twins.push({
        score: getScore(source, point),
        point: point,
        body: pointAndBody.body
      });
    }
  };
  if (twins.length == 0) {
    return null;
  }
  var sorted = twins.sort(function(a, b) {
    return a.score - b.score;
  });
  return sorted[0];
}

module.exports = PhysicsUtils
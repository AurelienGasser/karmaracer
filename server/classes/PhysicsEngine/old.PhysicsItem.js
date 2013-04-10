var KLib = require('./../KLib');

var PhysicsItemID = 0;

var PhysicsItem = function(_arguments) {
    if(!KLib.isUndefined(_arguments)) {
      this.initialize(_arguments);
    }
  }

PhysicsItem.prototype.initialize = function(_arguments) {
  this.id = PhysicsItemID++;
  this.size = {
    w: _arguments['size'].w,
    h: _arguments['size'].h
  };
  if(!KLib.isUndefined(_arguments['name'])) {
    this.name = _arguments['name'];
  }
  this.body = _arguments['physicsEngine'].createSquareBody(this, _arguments);
  this.engine = _arguments['physicsEngine'];
  // this.engine.gameServer.engine.createBody(_arguments['position'], this.size);
}
PhysicsItem.prototype.destroy = function() {
  if(this.body) {
    if(!KLib.isUndefined(this.body.fixture)) {
      this.body.DestroyFixture(this.body.fixture);
    }
    this.engine.world.DestroyBody(this.body);
    this.body = null;
  }
}
PhysicsItem.prototype.scheduleForDestroy = function() {
  this.engine.itemsToDestroy.push(this);
}
PhysicsItem.prototype.getPosition = function() {
  if(this.body != null) {
    return this.body.GetPosition();
  }
  return {
    x: 200,
    y: 200
  };
}
PhysicsItem.prototype.getVector = function(power, angle) {
  if(!angle) {
    angle = 0;
  }
  angle += this.getAngle();
  var v = {
    x: power.x * Math.cos(angle),
    y: power.y * Math.sin(angle)
  };
  return v;
}
PhysicsItem.prototype.getSize = function() {
  return this.size;
}
PhysicsItem.prototype.addAngle = function(a) {
  if(this.body !== null) {
    // var angle = this.getAngle();
    // angle += a;
    // this.setAngle(angle);
    this.body.SetAngularVelocity(this.body.GetAngularVelocity() + a);
  }
}
PhysicsItem.prototype.getAngle = function() {
  if(this.body !== null) {
    return this.body.GetAngle();
  }
  return 0;
}
PhysicsItem.prototype.setAngle = function(angleRad) {
  if(this.body !== null) {
    angleRad = angleRad % Math.PI;
    return this.body.SetAngle(angleRad);
  }
};
PhysicsItem.prototype.turn = function(side) {
  var angleToAdd = side * Math.PI / 4;
  this.addAngle(angleToAdd);
}


PhysicsItem.prototype.getShared = function() {
  // console.log('ENGINE', this);
  var pos = this.getPosition();
  var share = {
    x: pos.x * this.engine.gScale,
    y: pos.y * this.engine.gScale,
    r: this.getAngle(),
    w: this.size.w * this.engine.gScale,
    h: this.size.h * this.engine.gScale
  };
  if(!KLib.isUndefined(this.name)) {
    share.name = this.name;
  }
  return share;
}
PhysicsItem.prototype.applyForceToBody = function(v) {
  if(!KLib.isUndefined(this.body) && this.body !== null) {
    var pos = this.body.GetPosition();
    //pos.x += 1;
    this.body.ApplyImpulse(v, {
      x: pos.x,
      y: pos.y
    });

  }
}

PhysicsItem.prototype.reduceAngularVelocity = function(reduceBy) {
  if(this.body != null) {
    this.body.m_angularVelocity *= (1 - reduceBy);
    if(Math.abs(this.body.m_angularVelocity) < 0.005) this.body.m_angularVelocity = 0;
  }
}
PhysicsItem.prototype.reduceLinearVelocity = function(reduceBy) {
  if(this.body != null) {
    this.body.m_linearVelocity.x *= (1 - reduceBy);
    this.body.m_linearVelocity.y *= (1 - reduceBy);
    if(Math.abs(this.body.m_linearVelocity.x) < 0.005) this.body.m_linearVelocity.x = 0;
    if(Math.abs(this.body.m_linearVelocity.y) < 0.005) this.body.m_linearVelocity.y = 0;
  }
}

module.exports = PhysicsItem;
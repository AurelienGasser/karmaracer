var backbone = require('backbone');
var _ = require('underscore');

var PhysicsItem = backbone.Model.extend({
  urlRoot: '/physicsItem',
  initialize: function(_arguments) {
    this.id = Math.floor(Math.random() * 1e100);
    this.size = {
      w: _arguments['size'].w,
      h: _arguments['size'].h
    };
    if(!_.isUndefined(_arguments['name'])) {
      this.name = _arguments['name'];
    }
    this.body = _arguments['physicsEngine'].createSquareBody(this, _arguments['position'], this.size, _arguments['density'], _arguments['friction'], _arguments['angle'], _arguments['bullet'], _arguments['type'], _arguments['restitution']);
    this.engine = _arguments['physicsEngine'];
  },
  destroy: function() {
    if (this.body) {
      this.engine.world.DestroyBody(this.body);
      this.body = null;
    }
  },
  scheduleForDestroy: function() {
    this.engine.itemsToDestroy.push(this);
  },
  getPosition: function() {
    if(this.body != null) {
      return this.body.GetPosition();
    }
    return {
      x: 200,
      y: 200
    };
  },
  getVector: function(power, angle) {
    if (!angle) {
      angle = 0;
    }
    angle += this.getAngle();
    var v = {
      x: power.x * Math.cos(angle),
      y: power.y * Math.sin(angle)
    };
    return v;
  },
  getSize: function() {
    return this.size;
  },
  addAngle: function(a) {
    if(this.body !== null) {
      this.body.SetAngularVelocity(this.body.GetAngularVelocity() + a)
      // this.body.ApplyTorque(a)
    }
  },
  getAngle: function() {
    if(this.body !== null) {
      return this.body.GetAngle();
    }
    return 0;
  },
  setAngle:function(angleRad){
    if(this.body !== null) {
      angleRad = angleRad % Math.PI;
      return this.body.SetAngle(angleRad);
    }
  },
  turn: function(side) {
    var angleToAdd = side * Math.PI / 4;
    this.addAngle(angleToAdd);
  },
  getShared: function() {
    var pos = this.getPosition();
    var share = {
      x: pos.x * this.engine.gScale,
      y: pos.y * this.engine.gScale,
      r: this.getAngle(),
      w: this.size.w * this.engine.gScale,
      h: this.size.h * this.engine.gScale
    };
    if(!_.isUndefined(this.name)) {
      share.name = this.name;
    }
    return share;
  },
  applyForceToBody: function(v) {
    if(!_.isUndefined(this.body) && this.body !== null) {
      var pos = this.body.GetPosition();
      //pos.x += 1;
      this.body.ApplyImpulse(v, {
        x: pos.x,
        y: pos.y
      });
      
    }
  },
  reduceVelocityOfBody: function(reduceBy) {
    if(this.body != null) {
      this.body.m_linearVelocity.x /= 1 * reduceBy;
      this.body.m_linearVelocity.y /= 1 * reduceBy;
      this.body.m_angularVelocity /= 1 * reduceBy;
      if(Math.abs(this.body.m_linearVelocity.x) < 0.005) this.body.m_linearVelocity.x = 0;
      if(Math.abs(this.body.m_linearVelocity.y) < 0.005) this.body.m_linearVelocity.y = 0;
      if(Math.abs(this.body.m_angularVelocity) < 0.005) this.body.m_angularVelocity = 0;
    }
  }
});

module.exports = PhysicsItem;
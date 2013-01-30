var backbone = require('backbone');
var _ = require('underscore');
var box2d = require('box2dweb-commonjs');


var PhysicsItem = backbone.Model.extend({
  urlRoot: '/physicsItem',
  initialize: function(_arguments) {
    this.id = Math.floor(Math.random() * 1e100);
    this.size = {
      w: _arguments['size'].w,
      h: _arguments['size'].h
    };
<<<<<<< HEAD
    this.engine = _arguments['physicsEngine'];
    this.body = this.engine.createSquareBody(_arguments['position'], this.size, _arguments['density'], _arguments['friction'], _arguments['type'], _arguments['restitution']);
    this.body.SetUserData(this);

    if(!_.isUndefined(_arguments['name'])) {
=======
    if (!_.isUndefined(_arguments['name'])){
>>>>>>> fee60abcf7796e18fad765f87c45a6254dc160ad
      this.name = _arguments['name'];
      //console.log('name', this.name);
    }
    this.body = _arguments['physicsEngine'].createSquareBody(this, _arguments['position'], this.size, _arguments['density'], _arguments['friction']);
    this.engine = _arguments['physicsEngine'];
  },
  getPosition: function() {
    if(this.body !== null) {
      // return this.body.GetPosition();
      return this.body.GetWorldCenter();
    }
    return {
      x: 200,
      y: 200
    };
  },
  getVector: function(power) {
    var angle = this.getAngle();
    //console.log(power, this.getAngle());
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
      this.body.m_angularVelocity += a;
    }
  },
  getAngle: function() {
    if(this.body !== null) {
      var a = this.body.GetAngle();
      //console.log('angle', a, this.name, _.isUndefined(this.body));
      return this.body.GetAngle();
    }
    return 0;
  },
  turn: function(side) {
    var angleToAdd = side * Math.PI / 8;
    //    console.log('b', this.getAngle(), side, this.body !== null, angleToAdd);
    this.addAngle(angleToAdd);
    //    console.log('a', this.getAngle());
  },
  getShared: function() {
    var pos = this.getPosition();

    //console.log(this.name);
    var share = {
      x: pos.x * this.engine.gScale,
      y: pos.y * this.engine.gScale,
      r: this.getAngle(),
      w: this.size.w * this.engine.gScale,
      h: this.size.h * this.engine.gScale
    };
    if(!_.isUndefined(this.name)) {
      share.name = this.name;
      //console.log('name s', this.name);
    }
    //console.log(share);
    return share;
  },
  applyDirectionForce: function(power) {
    var v = this.getVector(power);
    if(!_.isUndefined(this.body) && this.body !== null) {
      var v2 = new box2d.b2Vec2(v.x, v.y);
      this.body.ApplyForce(v2, this.body.GetWorldCenter());      
    }
  },  
  applyForceToBody: function(v) {
    if(!_.isUndefined(this.body) && this.body !== null) {
      var v2 = new box2d.b2Vec2(v.x, v.y);
      var pos = this.body.GetPosition();
      //console.log('apply imp', v2, pos);
      //this.body.ApplyImpulse(v2, this.body.GetWorldCenter());      
      this.body.ApplyImpulse(v2, this.body.GetWorldCenter());      
    }
  },
  reduceVelocityOfBody: function(reduceBy) {
    if(this.body != null) {
      this.body.m_linearVelocity.x /= 1 * reduceBy;
      this.body.m_linearVelocity.y /= 1 * reduceBy;
      this.body.m_angularVelocity /= 1 * reduceBy;
      if(Math.abs(this.body.m_linearVelocity.x) < 0.005) this.body.m_linearVelocity.x = 0;
      if(Math.abs(this.body.m_linearVelocity.y) < 0.005) this.body.m_linearVelocity.y = 0;
      if(Math.abs(this.body.m_angularVelocity) < 0.005) this.body.m_linearVelocity.y = 0;
    }
  }
});

module.exports = PhysicsItem;
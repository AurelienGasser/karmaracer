var backbone = require('backbone');
var _ = require('underscore');
var b2d = require("box2d");

var PhysicsItem = backbone.Model.extend({
  urlRoot : '/physicsItem',
  initialize : function( _arguments){
    this.size = {w : _arguments['size'].w , h : _arguments['size'].h};
    this.body = _arguments['physicsEngine'].createSquareBody(_arguments['position'], this.size, _arguments['density'], _arguments['friction']);
    this.engine = _arguments['physicsEngine'];
  },
  getPosition : function(){
    if (this.body != null){
      return this.body.GetPosition();
    }
    return {x : 200, y : 200};
  },
  getSize : function(){
    return this.size;
  },
  addAngle : function(a){
    if (this.body != null){
      this.body.m_angularVelocity += a;
    }
  },
  getAngle : function(){
    if (this.body != null){
      return this.body.GetAngle();
    }
    return 0;
  },
  turn : function (side) {
    this.addAngle(side * Math.PI / 8);
  },
  getShared : function(){
    var pos = this.getPosition();
    var share = {x : pos.x, y : pos.y, r : this.getAngle(), w : this.size.w, h : this.size.h};
    return share;
  },
  applyForceToBody : function(v){
    if (this.body != null){
      var pos = this.body.GetPosition();
      this.body.ApplyImpulse(v, {x : pos.x , y : pos.y});
    }
  },
  reduceVelocityOfBody : function(reduceBy){
    if (this.body != null){
      this.body.m_linearVelocity.x /= 1 * reduceBy;
      this.body.m_linearVelocity.y /= 1 * reduceBy;
      this.body.m_angularVelocity /= 1 * reduceBy;
      if (Math.abs(this.body.m_linearVelocity.x) < 0.005) this.body.m_linearVelocity.x = 0;
      if (Math.abs(this.body.m_linearVelocity.y) < 0.005) this.body.m_linearVelocity.y = 0;
      if (Math.abs(this.body.m_angularVelocity) < 0.005) this.body.m_linearVelocity.y = 0;
    }
  }
});

module.exports = PhysicsItem;


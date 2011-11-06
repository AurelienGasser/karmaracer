var backbone = require('backbone');
var _ = require('underscore');
var b2d = require("box2d");

var PhysicsItem = backbone.Model.extend({
  urlRoot : '/physicsItem',
  initialize : function( _arguments){
    //console.log('create item : @', _arguments['position'], ', size :', _arguments['size'], ', _density : ', _arguments['density']);
    this.size = _arguments['size'];
    this.body = _arguments['physicsEngine'].createSquareBody(_arguments['position'], this.size, _arguments['density'], _arguments['friction']);
  },
  getPosition : function(){
    if (this.body != null){
      return this.body.GetPosition();
    }
    //var pos = this.body.GetPosition();
    //console.log('body pos : ', pos);
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
      return this.body.m_angularVelocity;  
    }
    return 0;
  },
  turn : function (side) {
    //console.log(this.body);
    this.addAngle(side * Math.PI / 8);
    //this.r += side * Math.PI / 8;
  },
  getShared : function(){
    var pos = this.getPosition();
    var share = {x : pos.x, y : pos.y, r : this.getAngle(), w : this.size.w, h : this.size.h};
    //console.log('share : ', share);
    return share;
  },
  applyForceToBody : function(v){
    if (this.body != null){
      this.body.ApplyForce(v, this.body.GetPosition());
    }
  },
  reduceVelocityOfBody : function(reduceBy){
    if (this.body != null){
      //this.body.m_angularVelocity = 0;      
      this.body.m_linearVelocity.x /= 1 * reduceBy;
      this.body.m_linearVelocity.y /= 1 * reduceBy;
      if (Math.abs(this.body.m_linearVelocity.x) < 0.005) this.body.m_linearVelocity.x = 0;    
      if (Math.abs(this.body.m_linearVelocity.y) < 0.005) this.body.m_linearVelocity.y = 0;
    }
  }
});

module.exports = PhysicsItem;


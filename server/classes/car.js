var backbone = require('backbone');
var _ = require('underscore');
var sys = require("sys");
var b2d = require("box2d");

var Car = backbone.Model.extend({
  urlRoot : '/cars',
  initialize : function(_world){
    this.r = 0;
    this.size = {
      w : 0.5,
      h : 0.5
    };
    this.car_model = {
      tires_resistance : .05
    };
    //this.world = _world;
    var bodyDef = new b2d.b2BodyDef();
    bodyDef.position.Set(0.5, 0.5);
    this.body = _world.CreateBody(bodyDef);
    var shapeDef = new b2d.b2PolygonDef();
    shapeDef.SetAsBox(this.size.w, this.size.h);
    shapeDef.density = 0.1;
    shapeDef.friction = 0.1;
    this.body.CreateShape(shapeDef);
    this.body.SetMassFromShapes();
  },
  getPosition : function(){
    var pos = this.body.GetPosition();
    return {x : pos.x, y : pos.y};
  },
  accelerationMax : 50,
  accelerate : function (ac){
    var v = {x : ac * Math.sin(this.r), y : ac * Math.cos(this.r)};
    this.body.ApplyForce(v, this.body.GetPosition());
  },
  turn : function (side) {
    this.r += side * Math.PI / 8;
  },
  getShared : function(){
    var pos = this.getPosition();
    return {x : pos.x, y : pos.y, r : this.r, w : this.size.w, h : this.size.h};
  },
  updatePos : function(){
    this.body.m_linearVelocity.x /= 1 + this.car_model.tires_resistance;
    this.body.m_linearVelocity.y /= 1 + this.car_model.tires_resistance;
  }
});

module.exports = Car;


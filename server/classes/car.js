var backbone = require('backbone');
var _ = require('underscore');
var sys = require("sys");
var b2d = require("box2d");

var Car = backbone.Model.extend({
  urlRoot : '/cars',
  initialize : function(_world){
    this.r = 0;
    this.velocity = {
      x : 0,
      y : 0
    };
    this.acceleration = {
      x : 0,
      y : 0
    };
    this.size = {
      w : 30.0,
      h : 90.0
    };
    //this.world = _world;
    var bodyDef = new b2d.b2BodyDef();
    bodyDef.position.Set(200.0, 300.0);
    this.body = _world.CreateBody(bodyDef);
    var shapeDef = new b2d.b2PolygonDef();
    shapeDef.SetAsBox(this.size.w, this.size.h);
    shapeDef.density = 0.0005;
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
   
    //this.body.SetLinearVelocity(v);
     //if (Math.abs(this.body.m_linearVelocity.x) < 30.0 && Math.abs(this.body.m_linearVelocity.y < 30.0)){
        var acc_helper = 1000;
        var v = {x : acc_helper * ac * Math.sin(this.r), y : acc_helper * ac * Math.cos(this.r)};
        this.body.ApplyForce(v, this.body.GetPosition());
     //} 
   
    /*
    this.acceleration.x += ac * Math.sin(this.r);
    this.acceleration.y += ac * Math.cos(this.r);

    for (var i in this.acceleration){
      if (this.acceleration[i] > this.accelerationMax) {
        this.acceleration[i] = this.accelerationMax;
      }      
    }
    */
    //this.body.SetLinearVelocity({x:0, y:0})
    //this.body.SetAngularVelocity(0);


  },
  reduceVelocity : function(){
    var SLOWER = 0.125;
    for (var i in this.velocity){
      if (this.velocity[i] > 0){
        this.velocity[i] /= 3;
        if (this.velocity[i] < SLOWER){ 
          this.velocity[i] = 0;
        }
      }else{
        this.velocity[i] /= 3;
        if (this.velocity[i] > SLOWER){ 
          this.velocity[i] = 0;
        }
      }
      
    }
  },
  turn : function (side) {
    this.r += side * Math.PI / 8;
  },
  getShared : function(){
    //return {x : this.position.x, y : this.position.y, r : this.r};
    var pos = this.getPosition();
    return {x : pos.x, y : pos.y, r : this.r, w : this.size.w, h : this.size.h};
  },
  updateVelocity : function(){
    this.velocity.x += this.acceleration.x;
    this.velocity.y += this.acceleration.y;
    this.acceleration = {x : 0, y : 0};

  },
  updatePos : function(){

    this.body.m_linearVelocity.x /= 1.1;
    this.body.m_linearVelocity.y /= 1.1;
    //if (this.body.m_linearVelocity.x < 0) this.body.m_linearVelocity.x = 0;
    //if (this.body.m_linearVelocity.y < 0) this.body.m_linearVelocity.y = 0;
    //this.updateVelocity();    
    // this.position.x += this.velocity.x;
    // this.position.y += this.velocity.y;
    // this.reduceVelocity();
  }
});

module.exports = Car;


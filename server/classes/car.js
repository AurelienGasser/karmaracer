var backbone = require('backbone');
var _ = require('underscore');


var Car = backbone.Model.extend({
  urlRoot : '/cars',
  initialize : function(){
    this.r = 0;
    this.position = {
      x : 0,
      y : 0
    };
    this.velocity = {
      x : 0,
      y : 0
    };
    this.acceleration = {
      x : 0,
      y : 0
    };
    this.size = {
      w : 55,
      h : 70
    }
  },
  accelerationMax : 50,
  accelerate : function (ac){
    this.acceleration.x += ac * Math.sin(this.r);
    this.acceleration.y += ac * Math.cos(this.r);

    for (var i in this.acceleration){
      if (this.acceleration[i] > this.accelerationMax) {
        this.acceleration[i] = this.accelerationMax;
      }      
    }
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
    return {x : this.position.x, y : this.position.y, r : this.r};
  },
  updateVelocity : function(){
    this.velocity.x += this.acceleration.x;
    this.velocity.y += this.acceleration.y;
    this.acceleration = {x : 0, y : 0};

  },
  updatePos : function(){
    this.updateVelocity();    
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.reduceVelocity();
  }
});

module.exports = Car;


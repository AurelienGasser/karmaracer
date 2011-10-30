var backbone = require('backbone');
var _ = require('underscore');
var Car = require ('./car');

var Cars = backbone.Collection.extend({
  model : Car,
  shareCars : {},
  initalize : function(){
    this.shareCars = this.getShared();
  },
  getShared : function(){
    var myCars = Array();
    _.each(this.models, function(c){
      //console.log(c.getPosition());
      myCars.push(c.getShared());
    });
    return myCars;
  },
  updatePos: function(){
    _.each(this.models, function(c){
      c.updatePos();
    });
    this.shareCars = this.getShared();
  }
});

module.exports = Cars;


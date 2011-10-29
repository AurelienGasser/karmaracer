var backbone = require('backbone');
var _ = require('underscore');
var Car = require ('./car');

var Cars = backbone.Collection.extend({
  model : Car,
  getShared : function(){
    var myCars = Array();

    _.each(this.models, function(c){

      myCars.push(c.getShared());
    });
    return myCars;
  }
});

module.exports = Cars;


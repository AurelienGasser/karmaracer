var _ = require('underscore');

var Heritage = {};

Heritage.extend = function(Parent, child) {
  var p = new Parent();
  for(var prop in p) {
    if(_.isUndefined(child[prop])) {
      var value = p[prop];
      child[prop] = value;
    }
  };
}

module.exports = Heritage;
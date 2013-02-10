var Heritage = {};

Heritage.extend = function(Parent, child) {
  var p = new Parent();
  // console.log(parent);
  for(var prop in p) {
    // if(parent.hasOwnProperty(prop)) {
      var value = p[prop];
      // console.log('extend', prop, value);
      child[prop] = value;
    // }
  };
}

module.exports = Heritage;
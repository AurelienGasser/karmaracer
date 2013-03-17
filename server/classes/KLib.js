var KLib = {};

KLib.isFunction = function(obj) {
  return typeof obj === 'function';
};

//http://jsperf.com/tests-for-undefined/2
KLib.isUndefined = function(obj) {
  return obj === void 0;
};

KLib.extend = function(Parent, child) {
  var p = new Parent();
  child.base = {};
  for(var prop in p) {
    if(KLib.isUndefined(child[prop])) {
      var value = p[prop];
      child[prop] = value;
    } else {
      child.base[prop] = Parent.prototype[prop];
    }
  };
}

module.exports = KLib;
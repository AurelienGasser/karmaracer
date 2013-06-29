var KLib = {};

KLib.isFunction = function(obj) {
  return typeof obj === 'function';
};

//http://jsperf.com/tests-for-undefined/2
KLib.isUndefined = function(obj) {
  return obj === void 0;
};

function construct(constructor, args) {
  function F() {
    return constructor.apply(this, args);
  }
  F.prototype = constructor.prototype;
  return new F();
}

KLib.extend = function (Parent, child) {
  var p = construct(Parent, Array.prototype.slice.call(arguments, 2));
  child.base = {};
  for (var prop in p) {
    if (KLib.isUndefined(child[prop])) {
      var value = p[prop];
      child[prop] = value;
    } else {
      child.base[prop] = Parent.prototype[prop];
    }
  };
};

KLib.extendPrototype = function(base, extension) {
  for (var method in extension) {
    base.prototype[method] = extension[method];
  }
}

module.exports = KLib;
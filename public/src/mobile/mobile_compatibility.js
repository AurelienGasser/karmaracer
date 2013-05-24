(function() {
  'use strict';
  if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
      if (typeof this !== 'function') {
        // closest thing possible to the ECMAScript 5 internal IsCallable function
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }
      var fSlice = Array.prototype.slice,
      aArgs = fSlice.call(arguments, 1),
      fToBind = this,
      FNOP = function() {},
      fBound = function() {
        return fToBind.apply(this instanceof FNOP ? this : oThis || window,
        aArgs.concat(fSlice.call(arguments)));
      };
      FNOP.prototype = this.prototype;
      fBound.prototype = new FNOP();
      return fBound;
    };
  }
}());

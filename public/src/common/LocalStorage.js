(function() {
"use strict";

  var KLocalStorage = function() {
    if (_.isUndefined(localStorage.karma)) {
      this.karma = {};
    } else {
      this.karma = JSON.parse(localStorage.karma);
    }
    var that = this;

    function get(v) {
      return that.karma[v];
    }

    function exists(key) {
      var v = get(key);
      if (KLib.isUndefined(v) || v === null) {
        return false;
      } else {
        return true;
      }
    }

    function save() {
      localStorage.karma = JSON.stringify(that.karma);
    }

    function set(key, value) {
      that.karma[key] = value;
      save();
    }
    return {
      'get': get,
      'set': set,
      'exists': exists
    };
  };

  Karma.LocalStorage = new KLocalStorage();


}());
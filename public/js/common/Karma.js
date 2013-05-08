var Karma = function() {
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
    if (v === void 0) {
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
    'exists' : exists
  };
}();

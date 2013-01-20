var Karma = function() {
    this.karma = JSON.parse(localStorage.karma);
    // console.log(localStorage.karma, this.karma);
    var that = this;

    function get(v) {
      return that.karma[v];
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
      'set': set
    };
  }()
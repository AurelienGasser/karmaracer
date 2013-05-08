(function() {
  /*global console*/
  "use strict";

  function error(msg) {
    if (console) {
      console.error(msg);
    }
  }

  function info(msg) {
    if (console) {
      console.info(msg);
    }
  }

  Karma.Log = {
    error: error,
    info : info
  };
}());
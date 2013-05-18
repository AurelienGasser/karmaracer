(function() {
  "use strict";
  Karma.i18n = function(language, callback) {
    $.i18n.properties({
      name: 'translation',
      path: 'src/common/i18n/',
      mode: 'both',
      language: language,
      callback: callback
    });
  };
}());
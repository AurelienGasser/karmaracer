(function() {
  "use strict";

  $(function() {
    initBarEvents();
  });

  function onOptionsTapClick() {
    if ($('#options-folded').is(':visible')) {
      $('#options-folded').hide();
      $('#options-expanded').show();
      $('#options').show();
    } else {
      $('#options-folded').show();
      $('#options-expanded').hide();
      $('#options').hide();
    }
  }

  function initBarEvents() {
    $('#options-bar').click(onOptionsTapClick);
    $('#options-bar').on('touchstart', onOptionsTapClick);
  }

}());
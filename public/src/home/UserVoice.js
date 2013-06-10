(function() {
  "use strict";
  var uv = document.createElement('script');
  uv.type = 'text/javascript';
  uv.async = true;
  uv.src = '//widget.uservoice.com/cnoFgY3wJeve9iGop6UA.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(uv, s);
})();


(function() {
  "use strict";
  var UserVoice = window.UserVoice || [];
  UserVoice.push(['showTab', 'classic_widget', {
      mode: 'full',
      primary_color: '#cc6d00',
      link_color: '#007dbf',
      default_mode: 'support',
      forum_id: 210335,
      tab_label: 'Commentaires et support',
      tab_color: '#cc6d00',
      tab_position: 'middle-right',
      tab_inverted: false
    }
  ]);

}());
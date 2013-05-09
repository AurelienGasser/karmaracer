
(function() {
  "use strict";

  var MiniMap = function($container) {
    this.$container = $container;

    this.$container.append('<canvas class="miniMap"></canvas>');
  };

  Karma.MiniMap = MiniMap;




}());

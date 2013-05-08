(function() {
  "use strict";

  Karma.GameInstance.prototype.setupSound = function() {
        // function html5_audio() {
    //   var a = document.createElement('audio');
    //   return !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));
    // }
    // this.play_html5_audio = false;
    // if(html5_audio()) this.play_html5_audio = true;
    // this.sounds = {};
    // this.setSound('ta', '/sounds/ta.mp3');
  };

  Karma.GameInstance.prototype.setSound = function(name, url) {
    var sound;
    if (this.play_html5_audio) {
      sound = new Audio(url);
      sound.load();
    } else {
      sound = $("<embed id='" + name + "' type='audio/mpeg' />");
      sound.attr('src', url);
      sound.attr('loop', false);
      sound.attr('hidden', true);
      sound.attr('autostart', false);
      sound.attr('enablejavascript', true);
      $('body').append(sound);
    }
    this.sounds[name] = sound;
  };

  Karma.GameInstance.prototype.play_sound = function(url) {

    if (this.play_html5_audio) {
      var snd = new Audio(url);
      snd.load();
      snd.play();
    } else {
      $("#sound").remove();
      var sound = $("<embed type='audio/mpeg' />");
      sound.attr('src', url);
      sound.attr('loop', false);
      sound.attr('hidden', true);
      sound.attr('autostart', true);
      $('body').append(sound);
    }
  };
}());
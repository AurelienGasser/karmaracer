(function() {

  function registerMaps() {
    $('ul#maps li a').on('click', function(e) {
      var p = $('#submit'); //[0].submit();
      Karma.set('playerName', $('#playerName').val());
      Karma.set('map', $(this).text());
      p.click();
      e.preventDefault();
      return false;
    });
  }

  function addMaps() {
    var o = [];
    maps = ['map1'];

    for(var i = 0; i < maps.length; i++) {
      var m = maps[i];
      o.push('<li><a href="game/',m,'" >', m, '</a></li>');
    };
    $('ul#maps').html(o.join(''));
  }


  function createHelp(k, text) {
    return {
      'key': k,
      'text': text
    };
  }

  function addHelps() {
    var helps = [];
    helps.push(createHelp('arrow top', 'accelerate'));
    helps.push(createHelp('arrow bottom', 'break'));
    helps.push(createHelp('arrow right', 'turn right'));
    helps.push(createHelp('arrow left', 'turn left'));
    helps.push(createHelp('space', 'shoot'));
    helps.push(createHelp('L', 'zoom'));
    helps.push(createHelp('P', 'unzoom'));

    var o = [];
    for(var i = 0; i < helps.length; i++) {
      var h = helps[i];
      o.push('<li>', h.key, ' = <b>', h.text, '</b></li>');
    };
    $('ul#keys').html(o.join(''));

  }

  $(function() {
    if (Karma.get('playerName')) {
      $('#playerName').val(Karma.get('playerName'));
    }
    addMaps();
    registerMaps();
    addHelps();
  });


}());
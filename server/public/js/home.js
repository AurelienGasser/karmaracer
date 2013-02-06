(function() {


  var host = window.location.hostname;
  var connection = io.connect(host);


  connection.emit('get_maps', function(err, maps) {
    //console.log(maps);
    addMaps(maps);
  });


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

  function addMaps(maps) {


    var o = [];
    //maps = ['map1'];
    for(var i = 0; i < maps.length; i++) {
      var m = maps[i];
      o.push('<li><a href="game.'+ m + '" >' + m + '</a>&nbsp;<a class="editLink" href="mm.'+ m + '" >edit</a></li>');
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
    helps.push(createHelp('&#8593;&nbsp;&#8595;', 'accelerate / break'));
    helps.push(createHelp('&#8592;&nbsp;&#8594;', 'turn left / right'));
    helps.push(createHelp('&#60;space&#62;', 'shoot'));
    helps.push(createHelp('L/P', 'zoom / unzoom'));

    var o = [];
    for(var i = 0; i < helps.length; i++) {
      var h = helps[i];
      o.push('<td class="help_keys">' + h.key + '</td><td class="help_keys_text">' + h.text + '</td>');
    };
    var html = '<table><tr>' + o.join('</tr><tr>') + '</tr></table>';
    $('#keys').html(html);

  }

  $(function() {
    if(Karma.get('playerName')) {
      $('#playerName').val(Karma.get('playerName'));
    }

    registerMaps();
    addHelps();
  });


}());
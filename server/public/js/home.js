$(function() {
  if(Karma.get('playerName')) {
    $('#playerName').val(Karma.get('playerName'));
    $('#mainContent').show();
  } else {
    $('#playerName').keyup(function() {
      $('#mainContent').css('display', 'block');
    })
  }

  var host = window.location.hostname;
  var connection = io.connect(host);


  connection.emit('get_maps', function(err, maps) {
    // console.log(maps);
    addMaps(maps);
  });


  function registerMaps() {
    $('.mapLink').click(function(e) {
      console.log('saving ' +  $('#playerName').val())
      Karma.set('playerName', $('#playerName').val());
      Karma.set('map', $(this).text());
      return true;
    });
  }

  function addMaps(maps) {


    var o = [];
    //maps = ['map1'];
    for(var i = 0; i < maps.length; i++) {
      var m = maps[i];
      o.push('<li><a class="mapLink" href="game.'+ m + '" >' + m + '</a>&nbsp;<a class="editLink" href="mm.'+ m + '" >edit</a></li>');
    };
    $('ul#maps').html(o.join(''));
    registerMaps();
  }


  function createHelp(k, text) {
    return {
      'key': k,
      'text': text
    };
  }

  function addHelps() {
    var helps = [];
    helps.push(createHelp('&#8593;&nbsp;&#8595;', 'accelerate / go backward'));
    helps.push(createHelp('&#8592;&nbsp;&#8594;', 'turn left / right'));
    helps.push(createHelp('&#60;space&#62;', 'shoot'));
    helps.push(createHelp('L/P', 'zoom / unzoom'));
    helps.push(createHelp('B', 'break'));
    helps.push(createHelp('Mouse Click', 'drive'));

    var o = [];
    for(var i = 0; i < helps.length; i++) {
      var h = helps[i];
      o.push('<td class="help_keys">' + h.key + '</td><td class="help_keys_text">' + h.text + '</td>');
    };
    var html = '<table><tr>' + o.join('</tr><tr>') + '</tr></table>';
    $('#keys').html(html);

  }

  addHelps();

});
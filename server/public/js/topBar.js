var TopBar = {};

(function() {

  function setTopBar() {
    var o = [];
    o.push('<div id="topBar" class="init"><ul id="topBarBoxes">');

    o.push('<li><form id="playerNameForm" href="#">');
    o.push('Welcome to Karma Racer, <input title="change your name here" id="playerName" type="text" placeholder="Your name" required="required" name="playerName" autocomplete="off"></input>');
    o.push('<input type="submit" style="display:none"/>');
    o.push('</form></li>');

    o.push('<li id="fbHighScore"/>');

    o.push('<li id="topHelp"><img src="/images/iconHelp.png" id="iconHelp"/>');
    o.push('<div id="keys"></div>');
    o.push('</li>')

    o.push('<li id="fbLoginImage"/>');

    o.push('</ul>');
    var loginZone = $(o.join(''));
    loginZone.hide();
    $('body').append(loginZone);

    var $keys = $('#keys');
    $("#iconHelp").hover(function() {
      $keys.show();
    }, function() {
      $keys.hide();
    });
    $('#keys').html(getHelps());
    $playerName = $('#playerName');

    $playerName.keyup(function() {
      Karma.set('playerName', $playerName.val());
    });

    loginZone.children().hide();


  }

  function createHelp(k, text) {
    return {
      'key': k,
      'text': text
    };
  }

  function getHelps() {
    var helps = [];
    helps.push(createHelp('&#8593;&nbsp;&#8595;', 'accelerate / go backward'));
    helps.push(createHelp('&#8592;&nbsp;&#8594;', 'turn left / right'));
    helps.push(createHelp('&#60;space&#62;', 'shoot'));
    helps.push(createHelp('L/P', 'zoom / unzoom'));
    helps.push(createHelp('B', 'break'));
    helps.push(createHelp('Mouse Click', 'drive'));

    var o = [];
    for (var i = 0; i < helps.length; i++) {
      var h = helps[i];
      o.push('<td class="help_keys">' + h.key + '</td><td class="help_keys_text">' + h.text + '</td>');
    };
    var html = '<table><tr>' + o.join('</tr><tr>') + '</tr></table>';
    return html;
  }
  TopBar.show = function() {
    $bar = $('#topBar');
    $bar.slideDown(function(){
      $bar.children().fadeIn();
    });
    setTimeout(function(){
      $bar.removeClass('init');
    }, 2500);    
  }

  TopBar.setTopBar = setTopBar;

}())
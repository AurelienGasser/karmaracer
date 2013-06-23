(function() {
  "use strict";

  function getPageName() {
    var url = document.URL;
    var list = url.split('/');
    var page = list[list.length - 1];
    if (page.indexOf('#') !== -1) {
      page = page.split('#')[0];
    }
    return page;
  }


  function setTopBar(connection) {
    var o = [];
    o.push('<div id="topBar" class="init"><ul id="topBarBoxes">');

    var page = getPageName();
    if (page !== '') {
      o.push('<li id="topHelp"><a href="/"><img src="/images/iconHome.png" id="iconHome"/></a></li>');
    }

    o.push('<li class="topBarMainZone"><form id="playerNameForm" href="#">');
    
    o.push($.i18n.prop('topbar_welcome'), '<input title="', $.i18n.prop('topbar_changename'), '" id="playerName" type="text" placeholder="Your name" required="required" name="playerName" autocomplete="off"></input>');
    o.push('<input type="submit" style="display:none"/>');
    o.push('</form></li>');

    o.push('<li id="fbHighScore"/>');

    o.push('<li id="topHelp"><img src="/images/iconHelp.png" id="iconHelp" title="', $.i18n.prop('topbar_help'), '"/>');
    o.push('<div id="keys"></div>');
    o.push('</li>');

    o.push('<li id="fbLoginImage">');
    o.push('<a href="/auth/facebook"><img src="/images/iconLogin.png" id="iconLogin" title="', $.i18n.prop('topbar_login'), '"/></a>');
    o.push('</li>');

    o.push('</ul>');
    var loginZone = $(o.join(''));
    loginZone.hide();
    $('body').append(loginZone);

    var $keys = $('#keys');
    $('#iconHelp').hover(function() {
      $keys.show();
    }, function() {
      $keys.hide();
    });
    $('#keys').html(getHelps());
    var $playerName = $('#playerName');

    $playerName.keyup(function() {
      var name = $(this).val();
      Karma.LocalStorage.set('playerName', name);
      connection.emit('updatePlayerNameTopBar', name);
    });


    $playerName.val(Karma.LocalStorage.get('playerName'));

    loginZone.children().hide();

    Karma.TopBar.show();


  }

  function createHelp(k, text) {
    return {
      'key': k,
      'text': text
    };
  }

  function getHelps() {
    var helps = [];
    helps.push(createHelp('&#8593;&nbsp;&#8595;', $.i18n.prop('topbar_help_arrows_updown')));
    helps.push(createHelp('&#8592;&nbsp;&#8594;', $.i18n.prop('topbar_help_arrows_leftright')));
    helps.push(createHelp('&#60;space&#62 / S', $.i18n.prop('topbar_help_space_shoot')));
    helps.push(createHelp('L / P', $.i18n.prop('topbar_help_zoomdezoom')));
    // helps.push(createHelp('B', 'break'));
    helps.push(createHelp('Mouse Click', 'drive'));

    var o = [];
    for (var i = 0; i < helps.length; i++) {
      var h = helps[i];
      o.push('<td class="help_keys">' + h.key + '</td><td class="help_keys_text">' + h.text + '</td>');
    }
    var html = '<table class="keys" cellspacing="0" cellpadding="0"><tr>' + o.join('</tr><tr>') + '</tr></table>';
    return html;
  }

  function show() {
    var $bar = $('#topBar');
    $bar.slideDown(function() {
      $bar.children().fadeIn();
    });
    setTimeout(function() {
      $bar.removeClass('init');
    }, 2500);
  }

  Karma.TopBar = {
    setTopBar: setTopBar,
    show: show,
    getHelps : getHelps
  };

}());
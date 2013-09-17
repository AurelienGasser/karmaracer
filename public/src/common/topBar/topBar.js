(function() {
  "use strict";
  /*global GKarmaOptions*/



  var pfx = ["webkit", "moz", "ms", "o", ""];

  function runPrefixMethod(obj, method) {
    var p = 0,
      m, t;
    while (p < pfx.length && !obj[m]) {
      m = method;
      if (pfx[p] === "") {
        m = m.substr(0, 1).toLowerCase() + m.substr(1);
      }
      m = pfx[p] + m;
      t = typeof obj[m];
      if (t != "undefined") {
        pfx = [pfx[p]];
        return (t == "function" ? obj[m]() : obj[m]);
      }
      p++;
    }
  }

  function getPageName() {
    var url = document.URL;
    var list = url.split('/');
    var page = list[list.length - 1];
    if (page.indexOf('#') !== -1) {
      page = page.split('#')[0];
    }
    // fix for fb callback
    if (page.indexOf('?code') === 0){
      page = '';
    }
    return page;
  }

  function setKarma(user) {
    if (user) {
      $('#topBarKarma').html($.i18n.prop('topbar_karma') + '</br>' + user.money);
    }
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

    o.push('<li id="topBarKarma" class="scoreZone"/>');
    o.push('<li id="fbHighScore" class="scoreZone"/>');
    if (GKarmaOptions.playerName !== '') {
      o.push('<li id="topShoping" class="topBarIcon"><a href="/marketplace"><img src="/images/iconShoping.png" id="iconShoping" title="', $.i18n.prop('topbar_shoping'), '"/></a></li>');
    }

    if (page !== '') {
      o.push('<li id="topFullScreen" class="topBarIcon"><img src="/images/iconFullScreen.png" title="', $.i18n.prop('topbar_toggleFullScreen'), '"/>');
      o.push('</li>');
    }

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

    connection.emit('getMyInfo', function(err, user) {
      setKarma(user);
    });

    setPlayerNameValue($playerName);

    $('#topFullScreen').click(function() {
      if (runPrefixMethod(document, "FullScreen") || runPrefixMethod(document, "IsFullScreen")) {
        runPrefixMethod(document, 'CancelFullScreen');
        $('#topFullScreen img').attr('src', '/images/iconFullScreen.png');
      } else {
        runPrefixMethod($('body')[0], 'RequestFullScreen');
        $('#topFullScreen img').attr('src', '/images/iconFullScreenExit.png');
      }

    });

    loginZone.children().hide();
    Karma.TopBar.show();
  }

  function setPlayerNameValue($playerName) {
    var dbValue = GKarmaOptions.playerName;
    if (dbValue !== '') {
      $playerName.val(dbValue);
    } else {
      $playerName.val(Karma.LocalStorage.get('playerName'));
    }
  }


  function createHelp(k, text) {
    return {
      'key': k,
      'text': text
    };
  }

  function getHelps() {
    var helps = [];
    helps.push(createHelp('&#8593;&nbsp; ' + $.i18n.prop('topbar_help_arrows_or_shift'), $.i18n.prop('topbar_help_arrows_up')));
    helps.push(createHelp('&#8595;', $.i18n.prop('topbar_help_arrows_down')));
    helps.push(createHelp($.i18n.prop('topbar_help_mouse'), $.i18n.prop('topbar_help_arrows_leftright')));
    helps.push(createHelp('&#60;space&#62 ' + $.i18n.prop('topbar_help_or') + ' S', $.i18n.prop('topbar_help_space_shoot')));
    helps.push(createHelp('L / P', $.i18n.prop('topbar_help_zoomdezoom')));

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
    // setTimeout(function() {
    //   $bar.removeClass('init');
    // }, 2500);
  }

  Karma.TopBar = {
    setTopBar: setTopBar,
    show: show,
    getHelps: getHelps,
    setKarma: setKarma
  };

}());
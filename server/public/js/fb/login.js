var kFB = {};

(function() {

  function getLoginStatus() {


    FB.getLoginStatus(function(response) {
      if (response.status === 'connected') {
        // connected
        afterLogin(response);
      } else if (response.status === 'not_authorized') {
        // not_authorized
        login();
      } else {
        // not_logged_in
        login();
      }
    });
  }

  function loginIfAuthorized() {

    FB.getLoginStatus(function(response) {
      if (response.status === 'not_logged_in') {
        login();
      }
      if (response.status === 'connected') {
        afterLogin();
      }
    });
  }

  function getScore(user) {
    try {
      FB.api("/" + user.id + "/scores/karmaracer_dev", function(response) {
        if (!response || response.error) {
          console.error(response);
        } else {
          var score = 0;
          if (response.data.length > 0) {
            score = response.data[0].score;
          }
          $('#fbHighScore').html('<div title="High Score">High Score : ' + score + '</div>');
          $('#login-zone').slideDown();
          $('#mainContent').fadeIn(2000);
        }
      });
    } catch (err) {
      console.error(err);

    }
  }



  function afterLogin() {
    updateName();
  }


  function createHeader() {
    var o = [];
    o.push('<div id="login-zone"><ul id="topBarBoxes">');

    o.push('<li><form id="playerNameForm" href="#">');
    o.push('Welcome to Karma Racer, <input id="playerName" type="text" placeholder="Your name" required="required" name="playerName" autocomplete="off"></input>');
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
    })

    KarmaHome.start();


  }

  function initFB() {

    console.log(G_fbid);

    createHeader();

    FB.Event.subscribe('auth.login', function(response) {
      afterLogin();
    });
    loginIfAuthorized();
    $('#fb-login').on('click', function() {
      getLoginStatus();
      $(this).off('click');
    });

  }


  function login() {
    FB.login(function(response) {
      if (response.authResponse) {
        // connected
        afterLogin();
      } else {
        // cancelled
      }
    }, {
      scope: 'publish_actions'
    });
  }

  function setup() {
    window.fbAsyncInit = function() {
      var prod = '512708015460560';
      var dev = '156724717828757';
      // publish_actions
      var host = window.location.hostname + ':' + window.location.port;
      var channelFile = 'http://' + host + '/channel.html';
      var options = {
        appId: prod, // App ID
        channelUrl: channelFile, // Channel File
        status: true, // check login status
        cookie: true, // enable cookies to allow the server to access the session
        xfbml: true // parse XFBML
      };

      if (host.indexOf('localhost') !== -1) {
        options.appId = dev;
      }
      FB.init(options);
      // Additional init code here
      initFB();

    };



    // Load the SDK Asynchronously
    (function(d) {
      var js, id = 'facebook-jssdk',
        ref = d.getElementsByTagName('script')[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement('script');
      js.id = id;
      js.async = true;
      js.src = "//connect.facebook.net/en_US/all.js";
      ref.parentNode.insertBefore(js, ref);
    }(document));
  };

  function setProfileImage(container, callback) {
    FB.api("/me/picture?width=180&height=180", function(response) {
      container.html('<img class="fb-picture" src="' + response.data.url + '">');
      return callback(null, response);
    });
  }

  function updateName() {
    FB.api('/me', function(user) {
      // var $container = $('#fb-login-box');
      // $container.html('');
      setProfileImage($('#fbLoginImage'), function() {});

      var exists = Karma.exists('playerName');
      console.log('name', Karma.get('playerName'));

      var savedName = Karma.get('playerName');
      if (!exists || savedName === '') {
        Karma.set('playerName', user.name);
        $('#playerName').val(user.name);
      } else {
        $('#playerName').val(savedName);
      }

      getScore(user);
      // setScore(user, 500);
    });
  }

  kFB.setup = setup;
  kFB.getLoginStatus = getLoginStatus;
  kFB.afterLogin = afterLogin;

  kFB.setup();


}());
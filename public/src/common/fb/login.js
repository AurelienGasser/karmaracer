// var kFB = {};

(function() {
  /*global FB, G_fbid*/
  "use strict";


  var kFB = {};

  kFB.host = function() {
    var host = window.location.hostname + ':' + window.location.port;
    return host;
  }();

  kFB.conf = function() {
    var dev = {
      appID: '156724717828757',
      appName: 'karmaracer_dev'
    };

    var prod = {
      appID: '512708015460560',
      appName: 'karmaracer'
    };

    if (kFB.host.indexOf('localhost') !== -1) {
      return dev;
    }
    return prod;

  }();



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


  function takeSoul(targetID) {
    var gFriendID = targetID;
    var url = '/me/' + kFB.conf.appName + ':take_the_soul_of?profile=' + gFriendID;
    FB.api(url, 'post', {}, function(response) {});
  }
  Karma.Facebook = {};
  Karma.Facebook.takeSoul = takeSoul;


  function getScore(userId) {
    if (userId === '' || KLib.isUndefined(userId)){
      return;
    }
    try {
      FB.api("/" + userId + "/scores/" + kFB.conf.appName, function(response) {
        if (!response || response.error) {
          Karma.Log.error(response);
        } else {
          var score = 0;
          if (response.data.length > 0) {
            score = response.data[0].score;
          }
          $('#fbHighScore').html($.i18n.prop('topbar_highscore') + '</br>' + score);
        }
      });
    } catch (err) {
      Karma.Log.error(err);
    }
  }

  function afterLogin() {
    updateTopBarProfile();
  }


  function initFB() {
    FB.Event.subscribe('auth.login', function() {
      afterLogin();
    });
    if (!KLib.isUndefined(G_fbid) && G_fbid !== '') {
      loginIfAuthorized();
    }
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
      // publish_actions
      var channelFile = 'http://' + kFB.host + '/channel.html';
      var options = {
        appId: kFB.conf.appID, // App ID
        channelUrl: channelFile, // Channel File
        // status: true, // check login status
        cookie: true, // enable cookies to allow the server to access the session
        xfbml: true, // parse XFBML
        oauth: true
      };
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
      js.src = "//connect.facebook.net/fr_FR/all.js";
      ref.parentNode.insertBefore(js, ref);
    }(document));
  }

  function setProfileImage(container, user, callback) {
    FB.api("/me/picture?width=180&height=180", function(response) {
      container.html('<img class="fb-picture" title="' + user.name + '" src="' + response.data.url + '">');
      return callback(null, response);
    });
  }

  function updateName(user){
    var exists = Karma.LocalStorage.exists('playerName');
    var savedName = Karma.LocalStorage.get('playerName');
    if (!exists || savedName === '') {
      Karma.LocalStorage.set('playerName', user.first_name);
      $('#playerName').val(user.first_name);
    } else {
      $('#playerName').val(savedName);
    }
  }

  function updateTopBarProfile() {
    FB.api('/me', function(user) {
      setProfileImage($('#fbLoginImage'), user, function() {});
      // updateName(user);
      getScore(user.id);
    });
  }

  kFB.setup = setup;
  kFB.getLoginStatus = getLoginStatus;
  kFB.afterLogin = afterLogin;
  kFB.updateScoreInTopBar = getScore;
  kFB.setup();

  Karma.FB = kFB;


}());
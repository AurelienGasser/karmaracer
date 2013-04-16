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

  function afterLogin() {
    updateName();
  }


  function initFB() {
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
    });
  }

  function setup() {
    window.fbAsyncInit = function() {
      var prod = '512708015460560';
      var dev = '156724717828757';
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

      console.log(host, options.appId, channelFile);
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



  function appendProfileImage(container, callback) {
    FB.api("/me/picture?width=180&height=180", function(response) {
      container.append('<img src="' + response.data.url + '">');
      return callback(null, response);
    });
  }

  function updateName() {
    FB.api('/me', function(user) {
      var $container = $('#fb-login-box');
      $container.html('');
      appendProfileImage($container, function() {
      });

      var exists = Karma.exists('playerName');
      if (!exists) {
        Karma.set('playerName', user.name);
        $('#playerName').val(user.name);
      }
    });
  }

  kFB.setup = setup;
  kFB.getLoginStatus = getLoginStatus;
  kFB.afterLogin = afterLogin;

  kFB.setup();


}());
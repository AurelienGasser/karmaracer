var kFB = {};

(function() {

  function getLoginStatus() {


    FB.getLoginStatus(function(response) {
      console.log('login response', response);
      if (response.status === 'connected') {
        // connected
        console.info('connected', response);
        afterLogin(response);
      } else if (response.status === 'not_authorized') {
        // not_authorized
        console.info('not_authorized');
        // login();

      } else {
        // not_logged_in
        console.info('not_logged_in');
        // login();
      }
    });
  }

  function afterLogin(user) {
    updateName();

  }


  function initFB() {
    FB.Event.subscribe('auth.login', function(response) {
      console.log('log in done');
      afterLogin();
    });

    getLoginStatus();

  }


  function login() {
    FB.login(function(response) {
      if (response.authResponse) {
        // connected
      } else {
        // cancelled
      }
    });
  }

  function setup() {
    window.fbAsyncInit = function() {
      var prod ='512708015460560';
      var dev = '156724717828757';
      var options = {
        appId: dev, // App ID
        channelUrl: 'http://localhost:8080/channel.html', // Channel File
        status: true, // check login status
        cookie: true, // enable cookies to allow the server to access the session
        xfbml: true // parse XFBML
      };
        var host = window.location.hostname;

      if (host.indexOf('localhost') !== -1){
        options.appId = prod;
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


  $('#fb-login').on('click', function() {
    login();
  });

  function appendProfileImage(container, callback) {
    FB.api("/me/picture?width=180&height=180", function(response) {
      container.append('<img src="' + response.data.url + '">');
      return callback(null, response);
    });
  }

  function updateName() {
    // console.log('Welcome! Fetching your information.... ');
    FB.api('/me', function(user) {
      console.log(user, 'Good to see you, ' + user.name + '.');

      var $container = $('#fb-login');
      $container.html('');
      appendProfileImage($container, function() {
        var o = ['</br></br>', user.name];
        $container.append(o.join(''));
      });


    });
  }

  kFB.setup = setup;
  kFB.getLoginStatus = getLoginStatus;
  kFB.afterLogin = afterLogin;

  kFB.setup();


}());
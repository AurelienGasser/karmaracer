
var kFB = {};

(function(){

function getLoginStatus(){


  FB.getLoginStatus(function(response) {
    console.log('login response', response);
  if (response.status === 'connected') {
    // connected
    console.info('connected');
  } else if (response.status === 'not_authorized') {
    // not_authorized
    console.info('not_authorized');
    login();

  } else {
    // not_logged_in
    console.info('not_logged_in');
    login();
  }
 });
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

function setup(){
  window.fbAsyncInit = function() {
    FB.init({
      appId      : '512708015460560', // App ID
      channelUrl : 'http://localhost:8080/channel.html', // Channel File
      status     : true, // check login status
      cookie     : true, // enable cookies to allow the server to access the session
      xfbml      : true  // parse XFBML
    });

    // Additional init code here
    getLoginStatus();

  };

  // Load the SDK Asynchronously
  (function(d){
     var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement('script'); js.id = id; js.async = true;
     js.src = "//connect.facebook.net/en_US/all.js";
     ref.parentNode.insertBefore(js, ref);
   }(document));
};


function updateName(){
  
}

kFB.setup = setup;
kFB.getLoginStatus = getLoginStatus;


kFB.setup();

}());


var FBConf = function() {

  var os = require("os");
  var host = os.hostname();

  console.info('run on host', host);

  var dev = {
    appID: '156724717828757',
    appSecret: 'ffaa699130856b56f56c6d2b04afd2d8',
    callbackURL: 'https://localhost/auth/facebook/callback',
    appName : 'karmaracer_dev',
    env : 'dev'
  };

  var prod = {
    appID: '512708015460560',
    appSecret: '208a70456e24df5d25f4e136aa83a930',
    callbackURL: 'https://karma.origamix.fr/auth/facebook/callback',
    appName : 'karmaracer',
    env : 'prod'
  };

  if (host === 'ks3096106.kimsufi.com') {
    console.info('fb host is prod', host);
    return prod;
  } else {
    console.info('fb host is dev', host);
    return dev;
  }

}();

module.exports = FBConf;
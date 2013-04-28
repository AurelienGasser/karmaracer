var FBConf = function() {

  var os = require("os");
  var host = os.hostname();

  console.info('run on host', host);

  var dev = {
    appID: '156724717828757',
    appSecret: 'ffaa699130856b56f56c6d2b04afd2d8',
    callbackURL: 'http://localhost:8080/auth/facebook/callback'
  };

  var prod = {
    appID: '512708015460560',
    appSecret: '208a70456e24df5d25f4e136aa83a930',
    callbackURL: 'http://karma.origamix.fr:8080/auth/facebook/callback'
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
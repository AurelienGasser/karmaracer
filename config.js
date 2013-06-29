var os = require("os");

var configSingleton = function() {
  var config = {
    host: os.hostname(),
    physics: {}
  }
  if (config.host === 'ks3096106.kimsufi.com') {
    config.env = 'prod';
  } else {
    config.env = 'dev';
  }

  switch (config.env) {
    case "prod":
      config.appID = '512708015460560';
      config.appSecret = '208a70456e24df5d25f4e136aa83a930';
      config.callbackURL = 'https://karma.origamix.fr/auth/facebook/callback';
      config.appName = 'karmaracer';
      config.gameMaxLevel = 8;
      console.info('fb host is prod', config.host);
      break;
    case "dev":
      config.appID = '156724717828757';
      config.appSecret = 'b154448258775abf1cebc39eaa8df713';
      config.callbackURL = 'https://localhost/auth/facebook/callback';
      config.appName = 'karmaracer_dev';
      config.gameMaxLevel = 3;
      console.info('fb host is dev', config.host);
      break;
  }

  config.botsPerMap = 7;
  config.stepByStepMode = false;
  config.serverPath = __dirname;
  config.physics.dichotomyIterations = 3;
  config.botDensity = 1 / 2300;
  config.noBots = process.env.NO_BOTS;
  config.FBScope = 'publish_actions';

  console.info('run on host', config.host);

  return config;

}();

module.exports = configSingleton;
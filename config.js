var os = require("os");
var sharedConfig = require('./config_shared');

var configSingleton = function() {
  var config = {
    host:     os.hostname(),
    physics:  {},
    env:      process.env.NODE_ENV
  }
  switch (config.env) {
    case "prod":
      config.appID = '512708015460560';
      config.appSecret = '208a70456e24df5d25f4e136aa83a930';
      config.callbackURL = 'https://karma.origamix.fr/auth/facebook/callback';
      config.appName = 'karmaracer';
      config.gameMaxLevel = 9;
      config.port = 443;
      break;
    case "preprod":
      config.appID = '156724717828757';
      config.appSecret = 'b154448258775abf1cebc39eaa8df713';
      config.appName = 'karmaracer';
      config.gameMaxLevel = 8;
      config.port = 4430;
      config.callbackURL = 'http://karma.origamix.fr:' + config.port + '/auth/facebook/callback';
      break;
    case "dev":
      config.appID = '156724717828757';
      config.appSecret = 'b154448258775abf1cebc39eaa8df713';
      config.callbackURL = 'https://localhost/auth/facebook/callback';
      config.appName = 'karmaracer_dev';
      config.gameMaxLevel = 3;
      config.port = 443;
      break;
  }
  console.info('fb host is', config.env, config.host);
  config.physicalTicksPerSecond = 30;
  config.positionsSocketEmitsPerSecond = 20;
  config.botManagerTicksPerSecond = 15;
  config.userCommandsSentPerSecond = 20;
  config.botsPerMap = 7;
  config.serverPath = __dirname;
  config.botDensity = 1 / 2300;
  config.noBots = process.env.NO_BOTS;
  config.FBScope = 'publish_actions';
  config.physics.dichotomyIterations = sharedConfig.physics.dichotomyIterations;
  config.myCarSpeed = 7.5; // units per second
  config.myCarTurnSpeed = Math.PI;

  console.info('run on host', config.host);

  return config;

}();

module.exports = configSingleton;
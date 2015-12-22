var os = require("os");
var sharedConfig = require('./config_shared');

var configSingleton = function() {
  var config = {
    physics:  {},
    env:      process.env.NODE_ENV
  }
  switch (config.env) {
    case "production":
			config.host = 'https://karmaracer.herokuapp.com';
      config.appID = '512708015460560';
      config.appSecret = '208a70456e24df5d25f4e136aa83a930';
      config.appName = 'karmaracer';
      config.gameMaxLevel = 9;
      config.port = 443;
      break;
    case "local":
		default:
      config.host = 'https://localhost';
      config.appID = '156724717828757';
      config.appSecret = 'b154448258775abf1cebc39eaa8df713';
      config.appName = 'karmaracer_dev';
      config.gameMaxLevel = 3;
      config.port = 443;
      break;
  }
  console.info('fb host is', config.env, config.host);
  config.callbackURL = config.host + '/auth/facebook/callback';
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
  config.myCarSpeed = 11; // units per second
  config.myCarTurnSpeed = Math.PI * 2;

  console.info('run on host', config.host, '(' + os.hostname() + ')');

  return config;

}();

module.exports = configSingleton;
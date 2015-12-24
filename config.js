var os = require("os");
var sharedConfig = require('./config_shared');

var configSingleton = function() {
  var config = {
    host: 'http://localhost',
    port: 80,
    env: process.env.NODE_ENV,
    appID: '156724717828757',
    appName: 'karmaracer_dev',
    appSecret: 'b154448258775abf1cebc39eaa8df713',
		mongoUri: "mongodb://127.0.0.1:27017",
    gameMaxLevel: 3,
    physics:  {},
	  physicalTicksPerSecond: 30,
	  positionsSocketEmitsPerSecond: 20,
	  botManagerTicksPerSecond: 15,
	  userCommandsSentPerSecond: 20,
	  botsPerMap: 7,
	  serverPath: __dirname,
	  botDensity: 1 / 2300,
	  noBots: process.env.NO_BOTS,
	  FBScope: 'publish_actions',
	  physics:ichotomyIterations = sharedConfig.physics.dichotomyIterations,
	  myCarSpeed: 11, // units per second
	  myCarTurnSpeed: Math.PI * 2
  };
	
  switch (config.env) {
    case "production":
			config.host = 'https://karmaracer.herokuapp.com';
      config.port = process.env.PORT;
      config.appID = '512708015460560';
      config.appSecret = '208a70456e24df5d25f4e136aa83a930';
      config.appName = 'karmaracer';
      config.gameMaxLevel = 9;
			config.mongoUri = process.env.MONGOLAB_URI;
      break;
  }
  console.info('fb host is', config.env, config.host);
  config.callbackURL = config.host + '/auth/facebook/callback';
  console.info('run on host', config.host, '(' + os.hostname() + ')');

  return config;

}();

module.exports = configSingleton;
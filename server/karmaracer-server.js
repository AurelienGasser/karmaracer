var app = require('./server.js');
var gameServer = new (require('./GameServer'))(app);
var gameServerSocket = new (require('./GameServerSocket'))(gameServer);


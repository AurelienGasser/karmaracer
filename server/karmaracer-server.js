var app = require('./server.js');
var gameServer = new (require('./gameServer'))(app);
var gameServerSocket = new (require('./gameServerSocket'))(gameServer);


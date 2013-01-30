var app = require('./server.js');
<<<<<<< HEAD
var GameServer = require('./gameServer');


var gameServer = new GameServer(app);
//console.log(gameServer);  

// var Car = require('./classes/car');
// var c  = new Car(gameServer.physicsEngine);
=======
var gameServer = new (require('./gameServer'))(app);
var gameServerSocket = new (require('./gameServerSocket'))(gameServer);

>>>>>>> fee60abcf7796e18fad765f87c45a6254dc160ad

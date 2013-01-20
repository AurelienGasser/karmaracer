var app = require('./server.js');
var GameServer = require('./gameServer');


var gameServer = new GameServer(app);
//console.log(gameServer);  

// var Car = require('./classes/car');
// var c  = new Car(gameServer.physicsEngine);
var express = require ('express');
var backbone = require('backbone');
var _ = require('underscore');

var app = express.createServer();
var io = require('socket.io').listen(app);


var sys = require("sys");
var b2d = require("box2d");

io.set('log level', 1);

var port = 8090;
app.listen(port);
app.set ('views', __dirname + '/views');
app.set ('view engine', 'jade');

app.configure(function(){
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.cookieParser());

  app.use(express.static(__dirname + '/public'));
  app.use(express.session({secret:"grand mere"}));
  app.use(app.router);
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

});

app.get('/', function(req, res){
  res.render("index.jade", {
    layout:false, 
    'title' : 'Karma Racer', 
    server: 'http://' + (process.env.NODE_ENV == 'dev' ? 'localhost' : 'happyfunkyfoundation.com') + ':' + port + '/'
  });
});


app.dynamicHelpers({
  'session' : function(req, res) {
    return req.session;
  },
  'flash' : function(req, res) {
    return req.flash();
  }
});


// Define world
var worldAABB = new b2d.b2AABB();
worldAABB.lowerBound.Set(0, 0);
worldAABB.upperBound.Set(800.0, 600.0);

var gravity = new b2d.b2Vec2(0.0, 0.0);
var doSleep = true;

var world = new b2d.b2World(worldAABB, gravity, doSleep);

var Car = require('./classes/car');
var CarsCollection = require('./classes/cars');
var cars = new CarsCollection();

var clients = [];


// Run Simulation!
var timeStep = 1.0 / 60.0;

var iterations = 10;
// update all cars positions
setInterval(function () {
  world.Step(timeStep, iterations);
  cars.updatePos();
}, 20); 

io.sockets.on('connection', function (client) {
  console.log('client connected');
  clients.push(client);

  client.car = new Car(world);
  cars.add(client.car);
   
  client.interval = setInterval(function () {
    client.emit('objects', {myCar: client.car.getShared(), cars: cars.shareCars}); 
  }, 100);

  client.on('disconnect', function (socket) {
    cars.remove(client.car);
    clearInterval(client.interval);
  });

  client.on('turnCar', function (side) {
    client.car.turn(side);
  });

  client.on('accelerate', function (ac) {
    client.car.accelerate(ac);
  });

  client.on('chat', function (msg) {
    for (var i in clients) {
      clients[i].emit('chat_msg', msg);
    }
  });
});

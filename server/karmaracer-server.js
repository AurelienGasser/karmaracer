var express = require ('express');
var backbone = require('backbone');
var _ = require('underscore');

var app = express.createServer();
var io = require('socket.io').listen(app);


var sys = require("util");
var b2d = require("box2d");

io.set('log level', 1);

var port = 8082;
app.listen(port);
app.set ('views', __dirname + '/views');
app.set ('view engine', 'jade');
var serverHost = 'karma.origamix.fr';


app.configure('dev', function(){
  serverHost = 'localhost';
});

app.configure('pouya', function(){
  serverHost = 'pouya';
});

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
    default_draw_engine : req.query.forcecanvas ? "CANVAS" : "WEBGL",
    server: 'http://' + serverHost + ':' + port + '/'
  });
});

app.get('/m', function(req, res){
  res.render("mobile.jade", {
    layout:false,
    'title' : 'Karma Racer',
    default_draw_engine : "CANVAS",
    server: 'http://' + serverHost + ':' + port + '/'
  });
});

app.get('/canvas', function(req, res){
  res.render("index.jade", {
    layout:false,
    'title' : 'Karma Racer',
    default_draw_engine : "CANVAS",
    server: 'http://' + serverHost + ':' + port + '/'
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

var PhysicsItem = require('./classes/physicsItem');
var PhysicsEngine = require('./classes/physicsEngine');


var worldSize = {w : 800, h : 600};
var physicsEngine = new PhysicsEngine(worldSize);
physicsEngine.createWalls(worldSize);


var Car = require('./classes/car');
var CarsCollection = require('./classes/cars');
var cars = new CarsCollection();

var clients = [];



// update all cars positions
setInterval(function () {
  try{
    physicsEngine.step();
    cars.updatePos();

    
    //console.log(cars);
  }
  catch (e){
    console.log(e);
  }
}, 20);



io.sockets.on('connection', function (client) {
  console.log('client connected');

  client.emit('init', {size: worldSize, walls : physicsEngine.getShareWalls()});
  clients.push(client);

  client.on('init_done', function () {
    console.log('client init done');
    client.car = new Car(physicsEngine);
    cars.add(client.car);

    client.interval = setInterval(function () {
      client.emit('objects', {myCar: client.car.getShared(), cars: cars.shareCars});
    }, 20);
  });

  client.on('disconnect', function (socket) {
    try{
      physicsEngine.world.DestroyBody(client.car.body);
      cars.remove(client.car);
      clearInterval(client.interval);
      console.log('client left');      
    } catch (e){
      console.log(e);
    }


  });


  client.on('drive', function (navigate) {
    try{      
      //console.log('drive ', navigate);
      client.car.turn(navigate.turnCar);
      client.car.accelerate(navigate.accelerate);
    } catch (e){
      console.log(e);
    }
  });



  client.on('turnCar', function (side) {
    try{
      client.car.turn(side);
    } catch (e){
      console.log(e);
      //console.log('turn ', side);
    }
  });

  client.on('accelerate', function (ac) {
    try{
      client.car.accelerate(ac);
    } catch (e){
      console.log(e);
    }
    console.log('accelerate ', ac);
  });

  client.on('chat', function (msg) {
    for (var i in clients) {
      clients[i].emit('chat_msg', msg);
    }
  });
});









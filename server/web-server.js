var express = require ('express');
var backbone = require('backbone');
var _ = require('underscore');

var app = express.createServer();
var io = require('socket.io').listen(app);
io.set('log level', 1);

app.listen(8090);
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
  res.render("index.jade", {layout:false, 'title' : 'Karma Racer'});
});

var cars = new backbone.Collection;

app.dynamicHelpers({
  'session' : function(req, res) {
    return req.session;
  },
  'flash' : function(req, res) {
    return req.flash();
  }
});

var Car = backbone.Model.extend({
  turn : function (side) {
    r += side;
  }
});


io.sockets.on('connection', function (client) {
  console.log('client connected');
  
  var carID = cars.length + 1;
  var c = new Car({
    id : carID,
    x : 0,
    y : 0,
    velocity : {
      x : 0,
      y : 0
    },
    acceleration : {
      x : 0,
      y : 0
    },
    r : 0
  });
  cars.add(c);

  client.car = c;
  // client.emit('message', "Hi !! your car ID is : " + carID);
  // 
  client.interval = setInterval(function () {
    client.emit('objects', {myCar: client.car, cars: cars});
    console.log('send objects');
  }, 500);

  client.on('disconnect', function (socket) {
    console.log('client left, car ID is ', client.car.id);
    cars.remove(client.car);
    clearInterval(client.interval);
  });
  client.on('turnCar', function (side) {
    client.car.turn(side);
  });
});

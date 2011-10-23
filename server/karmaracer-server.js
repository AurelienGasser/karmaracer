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


app.dynamicHelpers({
  'session' : function(req, res) {
    return req.session;
  },
  'flash' : function(req, res) {
    return req.flash();
  }
});

var Car = backbone.Model.extend({
  urlRoot : '/cars',
  carID : 0,
  r : 0,
  id : 0,
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
  accelerationMax : 50,
  accelerate : function (ac){
    this.acceleration.x += ac * Math.sin(this.r);
    this.acceleration.y += ac * Math.cos(this.r);

    for (var i in this.acceleration){
      if (this.acceleration[i] > this.accelerationMax) {
        this.acceleration[i] = this.accelerationMax;
      }      
    }
  },
  reduceVelocity : function(){
    var SLOWER = 0.125;
    for (var i in this.velocity){
      if (this.velocity[i] > 0){
        this.velocity[i] /= 3;
        if (this.velocity[i] < SLOWER){ 
          this.velocity[i] = 0;
        }
      }else{
        this.velocity[i] /= 3;
        if (this.velocity[i] > SLOWER){ 
          this.velocity[i] = 0;
        }
      }
      
    }
  },
  turn : function (side) {
    //console.log('turning car before : ' + this.r);
    this.r += side * Math.PI / 8;
    //console.log('turning car : ' + this.r);
  },
  getShared : function(){
    return {x : this.x, y : this.y, r : this.r};
  },
  updateVelocity : function(){
    this.velocity.x += this.acceleration.x;
    this.velocity.y += this.acceleration.y;
    this.acceleration = {x : 0, y : 0};

  },
  updatePos : function(){
    this.updateVelocity();    
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.reduceVelocity();
    //console.log(this.acceleration);
  }
});

var CarsCollection = backbone.Collection.extend({
  model : Car,
  getShared : function(){
    var myCars = Array();
    //console.log("get shared list", this);
    _.each(this.models, function(c){
      //console.log(c);
      myCars.push(c.getShared());
    });
    return myCars;
  }
});
var cars = new CarsCollection;


//cars.add(new Car({}));

var clients = [];

io.sockets.on('connection', function (client) {
  console.log('client connected');
  clients.push(client);

  var carID = cars.length + 1;
  client.car = new Car({
    r : 0,
    id : 0,
    x : 0,
    y : 0,
    velocity : {
      x : 0,
      y : 0
    },
    acceleration : {
      x : 0,
      y : 0
    }    
  });  
  client.car.carID = carID;
  cars.add(client.car);
//  console.log(client.car.acceleration);
//  console.log(client.car.velocity );
  client.car.velocity = {x : 0, y : 0};

  //console.log('message', "Hi !! your car ID is : " + carID);
  //
   
  client.interval = setInterval(function () {
    var allCars = cars.getShared();
    client.emit('objects', {myCar: client.car.getShared(), cars: allCars});
    client.car.updatePos();
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

  client.on('chat_msg', function (msg) {
    for (var i in clients) {
      clients[i].emit('chat_msg', msg);
    }
  });

  
});

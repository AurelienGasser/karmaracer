var express = require('express');
var backbone = require('backbone');
var _ = require('underscore');
var fs = require('fs');


// FOR SSL IF REQUIRED
var ssl_options = {
  key: fs.readFileSync(__dirname + '/keys/karma-key.pem'),
  cert: fs.readFileSync(__dirname + '/keys/karma-cert.pem')
};

var app = express();


var sys = require("util");
var b2d = require("box2d");
var fs = require('fs');


var port = 8085;


// app.set('views', __dirname + '/views');
// app.set('view engine', 'jade');
var serverHost = 'karma.origamix.fr';

app.configure('dev', function() {
  serverHost = '192.168.1.103';
  port = 80;
});

app.configure('pouya', function() {
  serverHost = 'pouyaair';
});



var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
io.set('log level', 0);

server.listen(port);


app.configure(function(callback) {
  app.set('view engine', 'jade');
  app.set('views', __dirname + '/views');

  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.static(__dirname + '/public'));
  app.use(express.session({
    secret: "grand mere"
  }));
  app.use(app.router);
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});


// io.set('log level', 0);
// io.set('transports', ['websocket']);
app.get('/mm', function(req, res) {
  index(req, res, "mapmaker.jade", "CANVAS");
});

app.get('/', function(req, res) {
  index(req, res, "index.jade", "CANVAS");
});

app.get('/canvas', function(req, res) {
  index(req, res, "index.jade", "CANVAS");
});

function index(req, res, view, draw_engine) {
  res.render(view, {
    layout: false,
    'title': 'Karma Racer',
    default_draw_engine: draw_engine,
    server: 'http://' + serverHost + '/'
  });
}

// app.dynamicHelpers({
//   'session' : function(req, res) {
//     return req.session;
//   },
//   'flash' : function(req, res) {
//     return req.flash();
//   }
// });
var PhysicsItem = require('./classes/physicsItem');
var PhysicsEngine = require('./classes/physicsEngine');

// LOAD THE MAP
var map1_path = __dirname + '/public/maps/map1.json';
var map1String = fs.readFileSync(map1_path);
var map = JSON.parse(map1String);
var physicsEngine = new PhysicsEngine(map);

var Bullet = require('./classes/bullet');

var Car = require('./classes/car');
var CarsCollection = require('./classes/cars');
var cars = new CarsCollection();
var clients = [];
var bullets = {};

// update all cars positions
setInterval(function() {
  try {
    physicsEngine.step();
    cars.updatePos();
    updateBullets();
  } catch(e) {
    console.log("error", e);
  }
}, 20);

function updateBullets() {

  var deads = [];


  for(var id in bullets) {
    if(bullets.hasOwnProperty(id)) {
      var bullet = bullets[id];
      //console.log(bullet);
      bullet.accelerate(500);
      bullet.life -= 1;
      if(bullet.life < 0) {
        deads.push(id);
      }
    }
  }


  //console.log(Object.keys(bullets).length, deads);
  for(var i = 0; i < deads.length; i++) {
    var id = deads[i];
    physicsEngine.world.DestroyBody(bullets[id].body);
    delete bullets[id];

  };
}

//cars.push(new Car(physicsEngine));




function getGraphicBullets() {

  var graphics = [];
  for(var id in bullets) {
    if(bullets.hasOwnProperty(id)) {
      var bullet = bullets[id];
      var b = {
        x: bullet.getPosition().x,
        y: bullet.getPosition().y,
        w: bullet.size.w,
        h: bullet.size.h
      };
      graphics.push(b);
    }
  }
  return graphics;
}


io.sockets.on('connection', function(client) {
  console.log('client connected ');
  client.keyboard = {};
  var worldInfo = physicsEngine.getWorldInfo();
  //  console.log(worldInfo);
  client.emit('init', worldInfo);
  clients.push(client);

  client.on('init_done', function() {
    console.log('client init done');
    client.car = new Car(physicsEngine);
    cars.add(client.car);


    client.interval = setInterval(function() {
      client.emit('objects', {
        myCar: client.car.getShared(),
        cars: cars.shareCars,
        bullets: getGraphicBullets()
      });
    }, 64);
  });

  client.on('disconnect', function(socket) {
    try {
      physicsEngine.world.DestroyBody(client.car.body);
      cars.remove(client.car);
      clearInterval(client.interval);
      console.log('client left');
    } catch(e) {
      console.log(e);
    }
  });

  client.on('drive', function(events) {
    try {
      for(var event in events) {
        var state = events[event];
        if(state == 'start') {
          client.keyboard[event] = true;
        } else {
          client.keyboard[event] = false;
        }
      }
    } catch(e) {
      console.log(e);
    }
  });

  client.on('chat', function(msg) {
    for(var i in clients) {
      clients[i].emit('chat_msg', msg);
    }
  });
});

function handleClientKeyboard() {
  for(var i in clients) {
    var client = clients[i];
    for(var event in client.keyboard) {
      var state = client.keyboard[event];
      if(state) {
        switch(event) {
        case 'shoot':
          var b = new Bullet(client.car);
          //          console.log(b.id);
          bullets[b.id] = b;
          break;
        case 'forward':
          client.car.accelerate(6.0)
          break;
        case 'backward':
          client.car.accelerate(-6.0)
          break;
        case 'left':
          client.car.turn(3.0)
          break;
        case 'right':
          client.car.turn(-3.0)
          break;
        }
      }
    }
  }
}

setInterval(handleClientKeyboard, 10);
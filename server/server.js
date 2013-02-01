var express = require('express');
var backbone = require('backbone');
var _ = require('underscore');
var fs = require('fs');
var sys = require("util");

// FOR SSL IF REQUIRED
var ssl_options = {
  key: fs.readFileSync(__dirname + '/keys/karma-key.pem'),
  cert: fs.readFileSync(__dirname + '/keys/karma-cert.pem')
};

var app = express();
var port = 8080;

// app.set('views', __dirname + '/views');
// app.set('view engine', 'jade');
var serverHost = 'karma.origamix.fr';

app.configure('local', function() {
  serverHost = 'localhost';
  port = 80;
});

app.configure('dev', function() {
  serverHost = '192.168.1.103';
  port = 80;
});

app.configure('aurel', function() {
  serverHost = '192.168.1.101';
  port = 80;
});

app.configure('pouya', function() {
  serverHost = 'pouyaair';
});

app.configure('tib', function() {
  serverHost = 'localhost';
});



var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
io.set('log level', 1);

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

app.get('/game\.:map', function(req, res) {

  index(req, res, "index.jade", "CANVAS");
});

app.get('/', function(req, res) {
  index(req, res, "home.jade", "CANVAS");
});


app.get('/canvas', function(req, res) {
  index(req, res, "index.jade", "CANVAS");
});

function index(req, res, view, draw_engine) {
  var options = {
    layout: false,
    'title': 'Karma Racer',
    default_draw_engine: draw_engine,
    server: 'http://' + serverHost + '/',
  };
  var map = req.params.map;
  if (!_.isUndefined(map)){
    options['map'] = map;
  }
  res.render(view, options);
}

app.io = io;
module.exports = app;


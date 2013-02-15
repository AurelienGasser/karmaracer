var express = require('express');
var KLib = require('./classes/KLib');
var fs = require('fs');
var sys = require("util");
var memwatch = require('memwatch');


memwatch.on('leak', function(info) { 
  // console.log('LEAK', info);
});

memwatch.on('stats', function(stats) { 
  // console.log('HEAP STATS', stats);
});
// FOR SSL IF REQUIRED
var ssl_options = {
  key: fs.readFileSync(__dirname + '/keys/karma-key.pem'),
  cert: fs.readFileSync(__dirname + '/keys/karma-cert.pem')
};

var app = express();
var port = 8080;

// app.set('views', __dirname + '/views');
// app.set('view engine', 'jade');
// var serverHost = 'karma.origamix.fr';
var os = require("os");
var hostname = os.hostname();

app.configure('local', function() {
  console.log('start on host', hostname);
});

var http = require('http');
var server = http.createServer(app);
server.on('error', function(e) {
  console.log('Critical Server Error:', e);
  console.log(e.stack);
  process.exit(1)
})

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
app.get('/mm\.:map', function(req, res) {
  index(req, res, "mapmaker.jade", "CANVAS");
});

app.get('/game\.:map', function(req, res) {

  index(req, res, "game.jade", "CANVAS");
});

app.get('/', function(req, res) {
  index(req, res, "index.jade", "CANVAS");
});


app.get('/canvas', function(req, res) {
  index(req, res, "index.jade", "CANVAS");
});

function index(req, res, view, draw_engine) {
  var options = {
    layout: false,
    'title': 'Karma Racer',
    default_draw_engine: draw_engine
    // server: 'http://' + serverHost + '/',
  };
  var map = req.params.map;
  if(!KLib.isUndefined(map)) {
    options['map'] = map;
  }
  res.render(view, options);
}

app.io = io;

var mapManager = require('./MapManager')(app);

module.exports = app;
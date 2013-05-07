var express = require('express');
var KLib = require('./libs/classes/KLib');
var fs = require('fs');
var sys = require("util");
var memwatch = require('memwatch');

var CONFIG = require('./config');

memwatch.on('leak', function(info) {
  // console.info('LEAK', info);
});

memwatch.on('stats', function(stats) {
  // console.info('HEAP STATS', stats);
});

var app = express();
var port = 8080;

var os = require("os");
var hostname = os.hostname();

app.configure('local', function() {});

var http = require('http');


// FOR SSL IF REQUIRED
var sslServer = CONFIG.env;
var ssl_options = {
  key: fs.readFileSync(__dirname + '/keys/' + sslServer + '.key'),
  cert: fs.readFileSync(__dirname + '/keys/' + sslServer + '.crt')
};

const https = require('https');

var server = https.createServer(ssl_options, app).listen(443);

server.on('error', function(e) {
  console.error('Critical Server Error:', e);
  console.error(e.stack);
  process.exit(1)
});

var io = require('socket.io').listen(server);
io.set('log level', 0);

var passport = require('passport');
var auth = require('./libs/authentication');

app.configure(function(callback) {

  app.set('view engine', 'jade');
  app.set('views', __dirname + '/views');

  // app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  app.use(express.session(auth.sessionOptions));

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);


  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));

  app.use(express.static(__dirname + '/public'));
});




function index(req, res, view, draw_engine) {
  var options = {
    layout: false,
    'title': 'Karma Racer',
    default_draw_engine: draw_engine,
    fbid: req.session.fbsid
  };
  var map = req.params.map;
  if (!KLib.isUndefined(map)) {
    options['map'] = map;
  }
  res.render(view, options);
}

auth.setup(app, io, index);

app.get('/mm\.:map', function(req, res) {
  index(req, res, "mapmaker.jade", "CANVAS");
});

app.get('/game\.:map', auth.ensureAuthenticated ,function(req, res) {
  index(req, res, "game.jade", "CANVAS");
});

app.get('/', auth.ensureAuthenticated, function(req, res) {
  index(req, res, "index.jade", "CANVAS");
});



app.io = io;

var mapManager = require('./libs/MapManager')(app);

module.exports = app;
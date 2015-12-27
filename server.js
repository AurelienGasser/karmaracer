var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var express = require('express');
var fs = require('fs');
var http = require('http');
var methodOverride = require('method-override');
var os = require('os');
var passport = require('passport');
var session = require('express-session');
var socketio = require('socket.io');
var sys = require("util");

var auth = require('./libs/authentication');
var config = require('./config');
var KLib = require('./libs/classes/KLib');

var hostname = os.hostname();
var app = express();
var server = http.createServer(app).listen(config.port);

server.on('error', function(e) {
  console.error('Critical Server Error:', e);
  console.error(e.stack);
  process.exit(1)
});

var io = socketio.listen(server);
io.set('log level', 0);

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

app.use(cookieParser());
app.use(bodyParser());
app.use(methodOverride());

app.use(session(auth.sessionOptions));

app.use(passport.initialize());
app.use(passport.session());

// app.use(auth.reloadUserFromDb);

app.use(errorHandler({
  dumpExceptions: true,
  showStack: true
}));

app.use(express.static(__dirname + '/public'));



var supportedLanguages = ['fr', 'en'];

function index(req, res, view, draw_engine, opts) {
  var options = {
    layout: false,
    'title': 'Karma Racer',
    default_draw_engine: draw_engine,
    locale: req.session.locale
  };

  options['playerName'] = null;
  options['fbid'] = null;
  if (req.session.user) {
    options['playerName'] = req.session.user.playerName;
    options['fbid'] = req.session.user.fbid;
  }
  if (KLib.isUndefined(options.locale)) {
    options.locale = 'en_GB';
  }

  options.locale = options.locale.substring(0, 2);
  if (supportedLanguages.indexOf(options.locale) === -1) {
    options.locale = 'en';
  }

  if (!KLib.isUndefined(opts)) {
    for (var o in opts) {
      options[o] = opts[o];
    }
  }

  var map = req.params.map;
  if (!KLib.isUndefined(map)) {
    options['map'] = map;
  }

  res.render(view, options);
}

auth.setup(app, io, index);

app.get('/', auth.reloadUserFromDbIfAuthenticated, function(req, res) {
  index(req, res, "index.jade", "CANVAS");
});

app.get('/game\.:map', auth.reloadUserFromDbIfAuthenticated, function(req, res) {
  index(req, res, "game.jade", "CANVAS");
});

app.get('/mm\.:map', auth.reloadUserFromDbIfAuthenticated, function(req, res) {
  index(req, res, "mapmaker.jade", "CANVAS");
});

//ensureAuthenticated
app.get('/marketplace', auth.reloadUserFromDbIfAuthenticated, function(req, res) {
  index(req, res, "marketplace.jade", "CANVAS");
});

app.get('/privacy', function(req, res) {
  index(req, res, "privacy.jade", "CANVAS");
});

app.get('/tos', function(req, res) {
  index(req, res, "tos.jade", "CANVAS");
});

app.get('/webgl', function(req, res) {
  res.render('test-client.jade');    
});  

app.io = io;

var DBManager = require('./libs/db/DBManager');
DBManager.connect(function(err, client) {
  if (err) {
    return null;
  } else {
    var MapManager = require('./libs/MapManager');
    var mapManager = new MapManager(app);

    app.get('/status', function(req, res) {
      res.render('status', {
        layout: false,
        numServers: Object.keys(mapManager.gameServers).length,
        numBots: mapManager.getNumBots(),
        loadAvg: os.loadavg()
      });
    })
  }
});

module.exports = app;
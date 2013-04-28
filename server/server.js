var express = require('express');
var KLib = require('./classes/KLib');
var fs = require('fs');
var sys = require("util");
var memwatch = require('memwatch');

var passport = require('passport');
// var passport = require('passport-facebook');
var FacebookStrategy = require('passport-facebook').Strategy;

var graph = require('fbgraph');


var fbConf = require('./classes/FBConf');


console.log(fbConf);

// var FACEBOOK_APP_ID = "156724717828757"
// var FACEBOOK_APP_SECRET = "ffaa699130856b56f56c6d2b04afd2d8";

passport.use(new FacebookStrategy({
  clientID: fbConf.appID,
  clientSecret: fbConf.appSecret,
  callbackURL: fbConf.callbackURL
},

function(accessToken, refreshToken, profile, done) {
  // asynchronous verification, for effect...
  process.nextTick(function() {

    graph.setAccessToken(accessToken);
    // To keep the example simple, the user's Facebook profile is returned to
    // represent the logged-in user. In a typical application, you would want
    // to associate the Facebook account with a user record in your database,
    // and return that user instead.
    profile.accessToken = accessToken;
    return done(null, profile);
  });
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


memwatch.on('leak', function(info) {
  // console.info('LEAK', info);
});

memwatch.on('stats', function(stats) {
  // console.info('HEAP STATS', stats);
});


var app = express();
var port = 8080;

// app.set('views', __dirname + '/views');
// app.set('view engine', 'jade');
// var serverHost = 'karma.origamix.fr';
var os = require("os");
var hostname = os.hostname();

app.configure('local', function() {});

var http = require('http');


// FOR SSL IF REQUIRED
var ssl_options = {
  key: fs.readFileSync(__dirname + '/keys/karma-key.pem'),
  cert: fs.readFileSync(__dirname + '/keys/karma-cert.pem')
};

const https = require('https');

// const crypto = require('crypto');
// var credentials = crypto.createCredentials({key: ssl_options.key, cert: ssl_options.cert});

// var server = http.createServer(app);
// server.setSecure(credentials);

var server = https.createServer(ssl_options, app).listen(443);

server.on('error', function(e) {
  console.error('Critical Server Error:', e);
  console.error(e.stack);
  process.exit(1)
});

var io = require('socket.io').listen(server);
io.set('log level', 0);


var MemoryStore = express.session.MemoryStore,
  sessionStore = new MemoryStore();
var sessionSecret = 'grand mere',
  sessionKey = 'session.sid',
  sessionOptions = {
    store: sessionStore,
    key: sessionKey,
    secret: sessionSecret
  };

io.configure(function() {
  io.set('authorization', function(data, accept) {

    accept(null, true);
    var parseCookie = express.cookieParser();
    if (data.headers.cookie) {
      // if there is, parse the cookie
      var cookie = require('cookie');
      data.cookie = cookie.parse(decodeURIComponent(data.headers.cookie));
      var connect = require('connect');
      // note that you will need to use the same key to grad the
      // session id, as you specified in the Express setup.
      data.sessionID = connect.utils.parseSignedCookie(data.cookie['session.sid'], sessionSecret);
      sessionStore.get(data.sessionID, function(err, session) {
        if (err || !session) {
          // if we cannot grab a session, turn down the connection
          accept('Error', false);
        } else {
          // save the session data and accept the connection
          data.session = session;
          if (KLib.isUndefined(data.session.fbsid)) {
            return accept('No FB Id', false);
          }
          accept(null, true);
        }
      });
    } else {
      // if there isn't, turn down the connection with a message
      // and leave the function.
      return accept('No cookie transmitted.', false);
    }
  });
});


// server.listen(port);



app.configure(function(callback) {

  app.set('view engine', 'jade');
  app.set('views', __dirname + '/views');

  // app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  app.use(express.session(sessionOptions));

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);


  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));

  app.use(express.static(__dirname + '/public'));
});

app.get('/mm\.:map', function(req, res) {
  index(req, res, "mapmaker.jade", "CANVAS");
});

app.get('/game\.:map', ensureAuthenticated, function(req, res) {
  index(req, res, "game.jade", "CANVAS");
});

app.get('/', ensureAuthenticated, function(req, res) {
  index(req, res, "index.jade", "CANVAS");
});

app.get('/login', function(req, res) {
  index(req, res, "login.jade", "CANVAS");
});


app.get('/canvas', function(req, res) {
  index(req, res, "index.jade", "CANVAS");
});



app.get('/auth/facebook',
passport.authenticate('facebook', {
  scope: 'publish_actions'
}), function(req, res) {
  // The request will be redirected to Facebook for authentication, so this
  // function will not be called.
});

app.get('/auth/facebook/callback',
passport.authenticate('facebook', {
  failureRedirect: '/login'
}), function(req, res) {
  var uid = req.session.passport.user.id;
  req.session.cookie.fbid = uid;
  req.session.fbsid = uid;
  req.session.accessToken = req.session.passport.user.accessToken;
  res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

function index(req, res, view, draw_engine) {
  var options = {
    layout: false,
    'title': 'Karma Racer',
    default_draw_engine: draw_engine,
    fbid: req.session.fbsid
    // server: 'http://' + serverHost + '/',
  };
  var map = req.params.map;
  if (!KLib.isUndefined(map)) {
    options['map'] = map;
  }
  res.render(view, options);
}

app.io = io;

var mapManager = require('./MapManager')(app);

module.exports = app;
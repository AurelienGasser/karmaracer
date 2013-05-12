var express = require('express');
var passport = require('passport');
var KLib = require('./classes/KLib');
var FacebookStrategy = require('passport-facebook').Strategy;
var graph = require('fbgraph');
var CONFIG = require('./../config');


var MemoryStore = express.session.MemoryStore,
  sessionStore = new MemoryStore();
var sessionSecret = 'grand mere',
  sessionKey = 'session.sid',
  sessionOptions = {
    store: sessionStore,
    key: sessionKey,
    secret: sessionSecret
  };


var setup = function(app, io, renderMethod) {


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

  passport.use(new FacebookStrategy({
    clientID: CONFIG.appID,
    clientSecret: CONFIG.appSecret,
    callbackURL: CONFIG.callbackURL
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


  function parse_signed_request(signed_request) {
    var list = signed_request.split('.');
    var encoded_sig = list[0];
    var payload = list[1];
    // decode the data
    var sig = base64_url_decode(encoded_sig);
    var data = JSON.parse(base64_url_decode(payload), true);

    return data;
  }

  function base64_url_decode(input) {
    return new Buffer(input, 'base64').toString('ascii')
  }

  // app.post('/game\.:map', function(req, res) {
  //   authFB(req);
  //   renderMethod(req, res, "game.jade", "CANVAS");
  // });
  app.post('/game\.:map', passport.authenticate('facebook', {
    successRedirect : '/gameok',
    failureRedirect: '/login'
  }), function(req, res) {});

  function authFB(req) {
    var fbReq = parse_signed_request(req.body.signed_request);
    req.session.fbsid = fbReq.user_id;
    req.session.accessToken = fbReq.oauth_token;
    graph.setAccessToken(fbReq.oauth_token);
  }

  app.post('/', passport.authenticate('facebook', {
    successRedirect : '/homeok',
    failureRedirect: '/login',
  }), function(req, res) {});

  

  app.get('/login', function(req, res) {
    renderMethod(req, res, "login.jade", "CANVAS");
  });



  var setupFBUser = function(req, res) {
    var referer = req.headers.referer;
    var list = referer.split('/');
    var path = list[list.length - 1];
    var route = '/' + path;
    if (path === 'login'){
      route = '/';
    }
    var uid = req.session.passport.user.id;
    req.session.fbsid = uid;
    req.session.accessToken = req.session.passport.user.accessToken;
    res.redirect(route);
  }

  app.get('/auth/facebook',
  passport.authenticate('facebook', {
    scope: 'publish_actions'
  }), function(req, res) {
    // The request will be redirected to Facebook for authentication, so this
    // function will not be called.
  });

  app.post('/auth/facebook',
  passport.authenticate('facebook', {
    successRedirect : '/ok',
    scope: 'publish_actions'
  }), function(req, res) {
    // The request will be redirected to Facebook for authentication, so this
    // function will not be called.
  });

  app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect : '/',
    failureRedirect: '/login'
  }), setupFBUser);



}

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  }

module.exports = {
  setup: setup,
  ensureAuthenticated: ensureAuthenticated,
  sessionOptions: sessionOptions
}
var CONFIG = require('./config');

var express = require('express');
var app = express();

var fs = require('fs');

var http = require('http');

// REQUIRED FOR SSL 
var sslServer = CONFIG.env;
var ssl_options = {
  key: fs.readFileSync(__dirname + '/keys/' + sslServer + '.key'),
  cert: fs.readFileSync(__dirname + '/keys/' + sslServer + '.crt')
};

const https = require('https');

var server = https.createServer(ssl_options, app).listen(443);

app.configure(function(callback) {

  // app.set('view engine', 'jade');
  // app.set('views', __dirname + '/views');

  // app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  // app.use(express.session(auth.sessionOptions));

  // app.use(passport.initialize());
  // app.use(passport.session());
  app.use(app.router);


  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));

  // app.use(express.static(__dirname + '/public'));
});

var callbackURL = 'https://localhost/';

var graph = require('fbgraph');

app.get('/', function(req, res) {
  if (!req.query.code) {
    var authUrl = graph.getOauthUrl({
      "client_id": CONFIG.appID,
      "redirect_uri": callbackURL
      // "scope": conf.scope
    });

    if (!req.query.error) { //checks whether a user denied the app facebook login/permissions
      res.redirect(authUrl);
    } else { //req.query.error == 'access_denied'
      res.send('access denied');
    }
    return;
  }


  graph.authorize({
    "client_id": CONFIG.appID,
    "redirect_uri": callbackURL,
    "client_secret": CONFIG.appSecret,
    "code": req.query.code
  }, function(err, facebookRes) {
    if (err) {
      console.log('res fb', err);
    }

    res.redirect('/ok');
    // getName(res);

    // var query = "SELECT native_hash FROM translation";
    // var query = 'INSERT INTO translation SET native_string = "' + add_name + '", local = "' + user_local + '", description = "' + add_description + '"';



  });
});



function getName(res) {
  var query = "SELECT native_hash FROM translation";
  // var query = "SELECT name FROM user WHERE uid = 797325065";

  // query = escape(query);
  graph.fql(query, function(err, fbres) {
    console.log(fbres); // { data: [ { name: 'Ricky Bobby' } ] }
    res.json(fbres);
  });

}

app.get('/ok', function(req, res) {
  // get authorization url

  var add_name = 'A';
  var add_description = 'A description';
  var user_local = 'fr_FR';

  getName(res);

  // var authUrl = graph.getOauthUrl({
  //   "client_id": CONFIG.appID,
  //   "redirect_uri": callbackURL
});

// // // shows dialog
// res.redirect(authUrl);

// after user click, auth `code` will be set
// we'll send that and get the access token
// });

// app.get('/', auth.ensureAuthenticated, function(req, res) {
//   index(req, res, "index.jade", "CANVAS");
// });
//
var Facebook = require('facebook-node-sdk');

// var facebook = new Facebook({
//   appId: '156724717828757',
//   secret: 'ffaa699130856b56f56c6d2b04afd2d8'
// });

var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
  clientID: '156724717828757',
  clientSecret: 'ffaa699130856b56f56c6d2b04afd2d8',
  callbackURL: "http://localhost:8080/"
},

function(accessToken, refreshToken, profile, done) {
  // asynchronous verification, for effect...
  process.nextTick(function() {

    // To keep the example simple, the user's Facebook profile is returned to
    // represent the logged-in user. In a typical application, you would want
    // to associate the Facebook account with a user record in your database,
    // and return that user instead.
    return done(null, profile);
  });
}));


passport.authenticate('facebook', {
  scope: 'publish_actions'
}, function() {
  console.log('ff');
});



// facebook.api('/797325065//scores/karmaracer_dev', function(err, data) {
//   console.log(err, data); // => { id: ... }
// });

// var express = require('express');
// var Facebook = require('facebook-node-sdk');

// var app = express();

// app.configure(function() {
//   app.use(express.bodyParser());
//   app.use(express.cookieParser());
//   app.use(express.session({
//     secret: 'foo bar'
//   }));
//   app.use(Facebook.middleware({
//     appId: '156724717828757',
//     secret: 'ffaa699130856b56f56c6d2b04afd2d8'
//   }));
// });

// app.get('/', Facebook.loginRequired(), function(req, res) {
//   req.facebook.api('/me', function(err, user) {
//     res.writeHead(200, {
//       'Content-Type': 'text/plain'
//     });
//     res.end('Hello, ' + user.name + '!');
//   });
// });

// var memwatch = require('memwatch');
// var KLib = require('./classes/KLib');
// var MemLeakLog = require('./MemLeakLog');

// var mem = new MemLeakLog();

// var gMem = new MemLeakLog('global mem');



// var Leak = function () {

// }

//     memwatch.on('stats', function(stats) {
//       console.info('MEM STATS', stats);
//     });

//     memwatch.on('leak', function(info) {
//       console.info('MEM LEAK', info);
//     });


// mem.register('Leak');


// function test() {
//   // new Leak();
//   // var l = new Leak();
//   // var l2 = new Leak();
//   // l.l = l2;
//   // l2.l = l;
//   // l = null;
//   // l2 = null;
// }


// gMem.save();
// gMem.register('Leak');

// gMem.always('Leak');

// var interval;
// var num = 10;

// var l;
// function step() {

//   mem.diff();
//   mem.save();
//   if(num > 0) {
//     // l = null;
//     l = new Leak();

//     // new Leak();

//   } else if(num < -20) {
//     clearInterval(interval);
//     l = null;
//     mem.diff();
//     mem.log();
//     gMem.diff();
//     gMem.log();
//     return;
//   }
//   num -= 1;
//   mem.diff();
//   mem.save();

//   mem.log();
// }


// mem.save();
// setTimeout(function() {
//   interval = setInterval(step, 32);
// }, 500);
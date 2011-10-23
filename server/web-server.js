var express = require ('express');
var app = express.createServer();
var io = require('socket.io').listen(app);
io.set('log level', 1);

app.listen(8080);
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




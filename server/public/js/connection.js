var karmaracer_server = "http://localhost:8090/";

var nodeserver = null;
function intiSockets(){
  nodeserver = io.connect(karmaracer_server);

  nodeserver.on('connect', function (data) {
    console.log("connected");
  });

  nodeserver.on('message', function (message) {
    console.log(message);  
  });

  nodeserver.on('car', function (car) {
    console.log(car);
  })
}

intiSockets();
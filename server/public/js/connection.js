var karmaracer_server = "http://192.168.1.101:8080/";

var nodeserver = null;
function intiSockets(){
  nodeserver = io.connect(karmaracer_server);

  nodeserver.on('connect', function (data) {
    console.log("connected");
  });

  nodeserver.on('message', function (message) {
    console.log(message);  
  });

}

intiSockets();
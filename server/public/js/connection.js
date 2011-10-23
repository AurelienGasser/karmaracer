//var karmaracer_server = "http://happyfunkyfoundation.com:8090/";
var karmaracer_server = "http://192.168.1.14:8090/";

var cars = null;

var nodeserver = null;
function intiSockets(){
  nodeserver = io.connect(karmaracer_server);

  nodeserver.on('connect', function (data) {
    //console.log("connected");
  });

  nodeserver.on('chat', function (message) {
    $("#chatbox").append(message, '<br/>');
  });

  nodeserver.on('chat_msg', function (msg) {
    $('#chat_msgs').append('<li>' + msg + '</li>');
  });

  nodeserver.on('chat_msg', function (msg) {
    $('#chat_msgs').append('<li>' + msg + '</li>');
  });

  nodeserver.on('objects', function (objects) {
      cars = objects.cars;
  });
}

intiSockets();

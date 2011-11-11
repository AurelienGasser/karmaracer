var cars = [];
var mycar = null;
var walls = [];
var nodeserver = null;



function initSockets(){
  nodeserver = io.connect(karmaracer_server);

  nodeserver.on('connect', function (data) {
  });

  nodeserver.on('init', function (data) {

    camera.setWorldSize(data.size);
  });


  nodeserver.on('chat_msg', function (msg) {
    $('#chat_msgs').append('<li>' + msg + '</li>');
  });

  nodeserver.on('objects', function (objects) {
    cars = objects.cars;
    mycar = objects.myCar;
    walls = objects.walls;
    //console.log('walls', walls);
    //console.log('my car : ', mycar);
  });
}


var cars = [];
alert('deploy8!');
var nodeserver = null;
function initSockets(){
  nodeserver = io.connect(karmaracer_server);

  nodeserver.on('connect', function (data) {
  });


  nodeserver.on('chat_msg', function (msg) {
    $('#chat_msgs').append('<li>' + msg + '</li>');
  });

  nodeserver.on('objects', function (objects) {
      cars = objects.cars;
      //console.log('cars received, ', cars);
      //drawCarsInCanvas(cars, "game-canvas");
  });
}


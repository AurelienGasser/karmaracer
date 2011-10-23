var karmaracer_server = "http://localhost:8090/";

var nodeserver = null;
function intiSockets(){
  nodeserver = io.connect(karmaracer_server);

  nodeserver.on('connect', function (data) {
    console.log("connected");
  });

  nodeserver.on('message', function (message) {
  });

  nodeserver.on('objects', function (objects) {
    $('body').html('');
    var a = [1, 2];
    $('body').html(_.map(objects.cars, function (car){
      return "<div class='car' style='top:" + car.x + ";left:" + car.y + ";-webkit-transform: rotate('" + car.r + "'); '></div>";
    }).join(""));
  });
}

intiSockets();

$(function () {
  $("html").keypress(function (ev) {
    if (ev.keycode == 111) {
      nodeserver.emit('turnCar', 1);
    }
    if (ev.keycode == 101) {
      nodeserver.emit('turnCar', -1);
    }
    console.log(ev);
  })
});
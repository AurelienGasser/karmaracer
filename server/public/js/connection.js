var karmaracer_server = "http://192.168.1.105:8090/";

var cars = null;

var nodeserver = null;
function intiSockets(){
  nodeserver = io.connect(karmaracer_server);

  nodeserver.on('connect', function (data) {
    console.log("connected");
  });

  nodeserver.on('message', function (message) {
  });

  nodeserver.on('objects', function (objects) {
      cars = objects.cars;
//    _.each(objects.cars, function(c) {
//      console.log(c);
  //  });
    // //console.log(objects);
    // //console.log(objects.cars);
    // //var car = objects.myCar;
    // $('body').html('');
    // // var a = [1, 2];
    // $('body').html(_.map(objects.cars, function (car){
    //   //console.log(car);
    //   return "<div class='car' style=\"top:" + car.x + ";left:" + car.y + ";-webkit-transform: rotate(" + car.r + "rad);-moz-transform: rotate(" + car.r + "rad); \">" + car.r+ "</div>";
    // }).join(""));

  });
}

intiSockets();
// 
// $(function () {
//   $("html").keypress(function (ev) {
//     ///console.log(ev);
//     if (ev.keyCode == 37) {
//       nodeserver.emit('turnCar', -1);
//       console.log("go right");
//     }
//     if (ev.keyCode == 39) {
//       nodeserver.emit('turnCar', 1);
//       console.log("go left");
//     }
//     if (ev.keyCode == 38) {
//       nodeserver.emit('accelerate', 5);
//       //return 0;
//       console.log("accelerate");
//     }    
//     //console.log(ev);
//   })
// });
var MemLeakLog = require('./MemLeakLog');

var mem = new MemLeakLog();


var game = function() {
    mem.diff();
    mem.save();
    var KarmaEngine = require('./classes/PhysicsEngine/KarmaPhysicsEngine');
    // var KLib = require('./classes/KLib');
    var engine = new KarmaEngine({
      'w': 256,
      'h': 256
    });


    var a = engine.createBody({
      'x': 50,
      'y': 50
    }, {
      'w': 10,
      'h': 10
    });

    var b = engine.createBody({
      'x': 50,
      'y': 50
    }, {
      'w': 10,
      'h': 10
    });


    // engine.destroy();
    engine = null;


    // KLib = null;
    // KarmaEngine = null;
    mem.diff();
    mem.save();

  };

mem.register('KarmaPhysicsEngine');
mem.register('KarmaPhysicsEngineBody');

mem.save();

game();


setTimeout(function() {
  mem.diff();
  mem.log();
}, 1000);



//
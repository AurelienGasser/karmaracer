var memwatch = require('memwatch');
var KLib = require('./classes/KLib');
var MemLeakLog = require('./MemLeakLog');

var mem = new MemLeakLog();

var gMem = new MemLeakLog('global mem');



var Leak = function () {

}

    memwatch.on('stats', function(stats) {
      console.info('MEM STATS', stats);
    });

    memwatch.on('leak', function(info) {
      console.info('MEM LEAK', info);
    });


mem.register('Leak');


function test() {
  // new Leak();
  // var l = new Leak();
  // var l2 = new Leak();
  // l.l = l2;
  // l2.l = l;
  // l = null;
  // l2 = null;
}


gMem.save();
gMem.register('Leak');

gMem.always('Leak');

var interval;
var num = 10;

var l;
function step() {

  mem.diff();
  mem.save();
  if(num > 0) {
    // l = null;
    l = new Leak();

    // new Leak();

  } else if(num < -20) {
    clearInterval(interval);
    l = null;
    mem.diff();
    mem.log();
    gMem.diff();
    gMem.log();
    return;
  }
  num -= 1;
  mem.diff();
  mem.save();

  mem.log();
}


mem.save();
setTimeout(function() {
  interval = setInterval(step, 32);
}, 500);
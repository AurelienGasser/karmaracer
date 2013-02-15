var memwatch = require('memwatch');
var KLib = require('./classes/KLib');
var MemLeakLog = require('./MemLeakLog');

var mem = new MemLeakLog();

var gMem = new MemLeakLog('global mem');



var Leak = function () {

}


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

function step() {

  mem.diff();
  mem.save();
  if(num > 0) {

    var l = new Leak();
    l = null;

  } else if(num < -20) {
    console.log('stop');
    clearInterval(interval);
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
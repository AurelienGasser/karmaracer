var KLib = require('./classes/KLib');
var memwatch = require('memwatch');

var MemLeakLog = function(name) {
  this.name = name;
    this.saveHeap = {};
    this.debug = {};
  }



MemLeakLog.prototype.register = function(name) {
  this.saveHeap[name] = {
    plus: 0,
    minus: 0,
    updates : 0
  };
  console.log('register mem', this.saveHeap);
}


MemLeakLog.prototype.always = function(name) {
  this.debug[name] = true;
}


MemLeakLog.prototype.save = function() {
  this.hd = new memwatch.HeapDiff();
}

MemLeakLog.prototype.diff = function() {
  if(KLib.isUndefined(this.hd)) {
    return;
  }

  var diff = this.hd.end();
  // console.log('log', diff);
  for(var i = 0; i < diff.change.details.length; i++) {
    var mDetail = diff.change.details[i];
    // console.log(mDetail);
    if(!KLib.isUndefined(this.saveHeap[mDetail.what])) {

      var h = this.saveHeap[mDetail.what];
      h.plus += mDetail['+'];
      h.minus += mDetail['-'];
      h.ratio = h.minus / h.plus;
      h.updates += 1;
      this.saveHeap[mDetail.what] = h;
    }
    if (this.debug[mDetail.what] === true){
      console.log(mDetail);
    }
  };
};

MemLeakLog.prototype.log = function() {
  if (!KLib.isUndefined(this.name)){
    console.log(this.name, this.saveHeap);
  } else {
  console.log(this.saveHeap);  
  }
  
};


function diffAndDisplayHeap(hd) {

  // console.log(g.saveHeap);
}

module.exports = MemLeakLog;
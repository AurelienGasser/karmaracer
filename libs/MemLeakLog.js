var KLib = require('./classes/KLib');

var MemLeakLog = function(name) {
    this.name = name;
    this.saveHeap = {};
    this.debug = {};
    this.logAll = false;
    this.enable = true;
  }



MemLeakLog.prototype.register = function(name) {
  this.saveHeap[name] = {
    plus: 0,
    minus: 0,
    updates: 0
  };
}


MemLeakLog.prototype.always = function(name) {
  this.debug[name] = true;
}


MemLeakLog.prototype.save = function() {
  if (!this.enable){
    return;
  }
}

MemLeakLog.prototype.diff = function() {
  if (!this.enable){
    return;
  }
  if(KLib.isUndefined(this.hd)) {
    return;
  }

  var diff = this.hd.end();
  for(var i = 0; i < diff.change.details.length; i++) {
    var mDetail = diff.change.details[i];
    if(!KLib.isUndefined(this.saveHeap[mDetail.what])) {
      var h = this.saveHeap[mDetail.what];
      h.plus += mDetail['+'];
      h.minus += mDetail['-'];
      h.ratio = h.minus / h.plus;
      h.updates += 1;
      this.saveHeap[mDetail.what] = h;
    }
    if(this.debug[mDetail.what] === true) {
      console.info(mDetail);
    }
    if(this.logAll) {
      console.info(mDetail);
    }
  };
};

MemLeakLog.prototype.log = function() {
  if (!this.enable){
    return;
  }
  if(!KLib.isUndefined(this.name)) {
    console.info(this.name, this.saveHeap);
  } else {
    console.info(this.saveHeap);
  }

};


function diffAndDisplayHeap(hd) {
}

module.exports = MemLeakLog;
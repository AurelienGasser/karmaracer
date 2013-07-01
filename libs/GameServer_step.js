var GameServer_step = {};

function registerDateDiff(timer, name, start) {
  var now = new Date();
  timer[name] = now - start;
  return now;
}

GameServer_step.initStep = function() {
  this.timer = {};
  this.lastStepTooLong = false;
  this.doStep = true;
  this.ticksPerSecond = 60;
  this.tickInterval = 16; // 1000 / this.ticksPerSecond;
  this.minTickInterval = this.tickInterval
  this.tickCounter = 0;
  this.tickTs = new Date();
}

GameServer_step.tryStep = function() {
  this.mem.diff();
  this.mem.save();
  if(this.doStep) {
    this.step();
  }
  this.tryStepAfterDelay(this.tickInterval);
  this.mem.diff();
  this.mem.save();
  this.mem.log();
  this.tickInterval += ((this.lastStepTooLong) ? 1 : -1);
  if(this.tickInterval < this.minTickInterval) {
    this.tickInterval = this.minTickInterval;
  }
}

GameServer_step.tryStepAfterDelay = function(time) {
  setTimeout(this.tryStep.bind(this), time);
}

GameServer_step.step = function() {
  if (this.doStep === false) {
    return;
  }
  var maxDiff = this.tickInterval;
  if(this.timer.lastDiff > maxDiff) {
    // console.error('Warning: main step takes too long...', this.map.name, this.timer.lastDiff + 'ms, max ', this.tickInterval, 'min ', this.minTickInterval); //, this.timer, 'max:', maxDiff);
    this.lastStepTooLong = true;
  } else {
    this.lastStepTooLong = false;
    // console.info("engine time", this.timer.lastDiff);
  }
  timer = this.timer;
  timer.begin = new Date();
  try {
    var start = new Date();
    start = registerDateDiff(timer, 'physics', start);
    if(this.tickCounter % 2 === 0) {
      start = new Date();
      this.weaponsManager.step();
      start = registerDateDiff(timer, 'weaponsManager', start);
      this.engine.step();
      start = registerDateDiff(timer, 'Physics', start);
    }
    if(this.tickCounter % 4 === 0) {
      this.sendPositionsToPlayers();
      start = registerDateDiff(timer, 'sendPositions', start);
    }
    if(this.tickCounter % 4 === 0) {
      start = new Date();
      this.botManager.tick();
      start = registerDateDiff(timer, 'botManager', start);
    }
  } catch(e) {
    console.error("error main interval", e, e.stack);
    throw e;
  }
  this.tickCounter = (this.tickCounter + 1) % this.ticksPerSecond
  registerDateDiff(timer, 'lastDiff', timer.begin);
}

module.exports = GameServer_step;
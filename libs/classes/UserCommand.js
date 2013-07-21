G_userCommandCounter = 0;

var UserCommand = function(action, state, ts) {
  this.action = action;
  this.state = state;
  this.ts = ts;
  this.seqNum = ++G_userCommandCounter;
  return this;
}

module.exports = UserCommand;
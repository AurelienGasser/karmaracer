G_userCommandCounter = 0;

var UserCommand = function(action, state, ts) {
  this.action = action;
  this.state = state;
  this.clientTs = ts;
  this.stopServerTs = null;
  this.doneTo = ts;
  this.seqNum = ++G_userCommandCounter;
  return this;
}

module.exports = UserCommand;
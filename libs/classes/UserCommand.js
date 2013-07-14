var UserCommand = function(command, state, ts) {
  this.command = command;
  this.state = state;
  this.ts = ts;
  return this;
}

module.exports = UserCommand;
var UserCommandUtils = { };
var ucu = UserCommandUtils;

UserCommandUtils.getTimeTodo = function(now, userCmd) {
  return (userCmd.stopServerTs || now) - userCmd.doneTo;
};

UserCommandUtils.getDistanceOrAngleToAdd = function(now, userCmd, speed) {
  return speed * ucu.getTimeTodo(now, userCmd);
};

module.exports = UserCommandUtils;
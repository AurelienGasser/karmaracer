var config = require('./../config');

module.exports = function(gameServer) {
  var perfTimes = [];
  var numTicks = 10000;
  for (var i = 0; i <= numTicks; ++i) {
    var start = new Date();
    gameServer.step();
    var end = new Date();
    if (config.performanceTest) {
      if (i % (numTicks / 10) === 0) {
        console.info(100 * i / numTicks + '%');
      }
      perfTimes.push(end - start);
      if (i === numTicks) {
        var sum = 0;
        for (var j in perfTimes) {
          sum += perfTimes[j];
        }
        console.info('* Performance:', sum + 'ms for', numTicks, 'ticks');
        process.exit(1)
      }
    }
  }
}
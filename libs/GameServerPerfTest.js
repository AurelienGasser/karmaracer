var config = require('./../config');

module.exports = function(gameServer) {
  var perfTimes = [];
  var numTicks = 1000;
  for (var i = 0; i <= numTicks; ++i) {
    var start = new Date();
    gameServer.step();
    var end = new Date();
    if (config.performanceTest) {
      if (i % (numTicks / 10) === 0) {
        console.log(100 * i / numTicks + '%');
      }
      perfTimes.push(end - start);
      if (i === numTicks) {
        var sum = 0;
        for (var j in perfTimes) {
          sum += perfTimes[j];
        }
        console.log('* Performance:', (sum / numTicks).toFixed(4) + 'ms/step (' + numTicks, 'ticks)');
        process.exit(1)
      }
    }
  }
}
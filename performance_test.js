var KLib = require('./libs/classes/KLib');
var fs = require('fs');
var sys = require("util");
var memwatch = require('memwatch');

var CONFIG = require('./config');
CONFIG.performanceTest = true;

memwatch.on('leak', function(info) {
  // console.info('LEAK', info);
});

memwatch.on('stats', function(stats) {
  // console.info('HEAP STATS', stats);
});

var os = require("os");
var hostname = os.hostname();

var MapManager = require('./libs/MapManager');
var mapManager = new MapManager(null);


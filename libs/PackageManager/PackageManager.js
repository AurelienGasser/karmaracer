var filesLib = require('./files');
var CONFIG = require('./../../config');
var fs = require('fs');
var KLib = require('./../classes/KLib');


var jsPath = CONFIG.serverPath + '/public/js/';
var options = {
  vendorsJSPath: jsPath + 'libs',
  commonJSPath: jsPath + 'common'
}

var PackageManager = function() {

}

PackageManager.prototype.brosweFilesAndDo = function(path, contains, output, callback) {
  filesLib.brosweFilesRec(path, function(err, files) {
    var contentString = '';
    for (var i = 0; i < files.length; i++) {
      var filePath = files[i];
      if (filePath.indexOf(contains) === -1) {
        continue;
      }
      var c = fs.readFileSync(filePath);
      contentString = contentString + c;
    };
    // fs.unlinkSync(output);
    // fs.writeFileSync(output, contentString);
    contentString = '';
    if (KLib.isFunction(callback)){
      return callback(null);
    }
  });
};


PackageManager.prototype.createCommonJSPackage = function(callback) {
  this.brosweFilesAndDo(options.commonJSPath, '.js', options.commonJSPath + '/common.js', callback);
};


PackageManager.prototype.createVendorJSPackage = function(callback) {
  this.brosweFilesAndDo(options.vendorsJSPath , '.js', options.vendorsJSPath + '/vendors.js', callback);
};


PackageManager.prototype.concat = function(files) {

};

module.exports = PackageManager;
var PackageManager = require('./libs/PackageManager/PackageManager');

var pm = new PackageManager();
pm.createVendorJSPackage();
pm.createCommonJSPackage();

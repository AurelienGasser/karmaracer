module.exports = function(grunt) {

  var G_options = {};
  var G_files = {};
  var G_JSHintFiles = [];
  var G_watchFiles = [];
  var G_watchFilesLess = [];

  G_options.concat = {};
  G_options.less = {};
  G_options.uglify = {};

  function addConcatModule(name, mimeType) {
    var moduleName = mimeType + '_' + name;
    G_options.concat[moduleName] = {
      src: G_files[moduleName],
      dest: 'public/dist/' + name + '.' + mimeType
    };
  }

  function addLessModule(name, mimeType) {
    var moduleName = mimeType + '_' + name;
    G_options.less[moduleName] = {
      src:  G_files[moduleName],
      dest: 'public/dist/' + name + '.css',
      options: {
        compress: true,
        yuicompress: true
      }
    };
  }

  function addUglifyModule(name, mimeType) {
    var moduleName = mimeType + '_' + name;
    G_options.uglify[moduleName] = {
      src: 'public/dist/' + name + '.' + mimeType,
      dest: 'public/dist/' + name + '.min.' + mimeType
    };
  }

  function addModule(name) {
    G_files['js_' + name] = ['public/src/' + name + '/startup.js', 'public/src/' + name + '/*.js', 'public/src/' + name + '/**/*.js', 'public/src/' + name + '/**/**/*.js'];
    G_files['less_' + name] = ['public/src/' + name + '/*.less', 'public/src/' + name + '/**/*.less', 'public/src/' + name + '/**/**/*.less'];
    G_JSHintFiles = G_JSHintFiles.concat(G_files['js_' + name]);
    G_watchFiles = G_watchFiles.concat(G_files['js_' + name]);
    G_watchFilesLess = G_watchFilesLess.concat(G_files['less_' + name]);
  }

  function addMainModule(name, modules) {
    var jsFiles = [];
    var lessFiles = [];
    for (var i = 0; i < modules.length; i++) {
      var modName = modules[i];
      jsFiles = jsFiles.concat(G_files['js_' + modName]);
      lessFiles = lessFiles.concat(G_files['less_' + modName]);
    };
    var allName = 'all_' + name;
    G_files['js_' + allName] = jsFiles;
    G_files['less_' + allName] = lessFiles;
    addConcatModule(allName, 'js');
    addUglifyModule(allName, 'js');
    addLessModule(allName, 'less');
  }

  addModule('game');
  addModule('home');
  addModule('mapmaker');
  addModule('common');
  addModule('mobile');
  addModule('desktop');
  addModule('marketplace');

  addMainModule('home', ['common', 'home']);
  addMainModule('game', ['common', 'game']);
  addMainModule('mapmaker', ['common', 'mapmaker']);
  addMainModule('mobile', ['mobile']);
  addMainModule('desktop', ['desktop']);
  addMainModule('marketplace', ['common', 'marketplace']);

  G_files.js_vendor_common = ['public/src/vendor/common/*.js'];
  G_files.js_vendor_webgl = ['public/src/vendor/webgl/*.js'];
  G_files.js_vendor_mapmaker = ['public/src/vendor/mapmaker/*.js'];
  addConcatModule('vendor_common', 'js');
  addConcatModule('vendor_mapmaker', 'js');
  addConcatModule('vendor_webgl', 'js');

  G_options.jshint = {
    // define the files to lint
    files: G_JSHintFiles, //['public/js/common/*.js', 'public/js/vendor/*.js', 'public/js/game/*.js'],
    // configure JSHint (documented at http://www.jshint.com/docs/)
    options: {
      onecase: true,
      strict: true,
      browser: true,
      // more options here if you want to override JSHint defaults
      globals: {
        jQuery: true,
        $: true,
        _: true,
        console: true,
        Karma: true,
        KLib: true,
        requestAnimFrame: true
      }
    }
  };

  G_options.pkg = grunt.file.readJSON('package.json');
  G_options.concat.options = {
    // banner: "'use strict';\n",
    process: function(src, filepath) {
      return '/* ' + filepath + ' */\n' + src;
    }
  };
  G_options.uglify.options = {
    banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
    // report: 'gzip'
  };
  G_options.watch = {
    concat: {
      files: G_watchFiles,
      tasks: ['concat']
    },
    less: {
      files: G_watchFilesLess,
      tasks: ['less'],
    }
  }

  // Project configuration.
  grunt.initConfig(G_options);

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'less']);
};
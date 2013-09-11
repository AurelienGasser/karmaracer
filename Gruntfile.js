module.exports = function(grunt) {
  var browserify_src_path = 'libs/shared_browserify.js';
  var browserify_dest_path = 'public/dist/shared.js';
  var browserify_deps = [
    'libs/classes/UserCommand.js',
    'libs/classes/Physics/Body.js',
    'libs/classes/Physics/Body_cache.js',
    'libs/classes/Physics/Body_move.js',
    'libs/classes/Physics/Body_shared.js',
    'libs/classes/Physics/Engine.js',
    'libs/classes/Physics/Engine_collisions.js',
    'libs/classes/Physics/Utils.js',
    'libs/classes/KLib.js',
    'config_shared',
  ];

  var G_options = {};
  var G_files = {};
  var G_JSHintFiles = [];
  var G_watchFiles = [];
  var G_watchFilesLess = [];

  G_options.concat = {};
  G_options.less = {};
  G_options.uglify = {};
  G_options.browserify = {};

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
    G_files['js_' + name] = [
      'public/src/' + name + '/startup.js',
      'public/src/' + name + '/*.js',
      'public/src/' + name + '/**/*.js',
      'public/src/' + name + '/**/**/*.js',
      browserify_dest_path
    ];
    G_files['less_' + name] = ['public/src/' + name + '/*.less', 'public/src/' + name + '/**/*.less', 'public/src/' + name + '/**/**/*.less'];
    // exclude shared physics engine from jshint because it is not strict code
    G_JSHintFiles = G_JSHintFiles.concat(G_files['js_' + name]).concat(['!' + browserify_dest_path]);
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
  addModule('browserify');

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
    },
    browserify: {
      files: browserify_deps.concat([browserify_src_path]),
      tasks: ['default']
    }
  }

  G_options.browserify = {
    all: {
      files: [{
        src: browserify_src_path,
        dest: browserify_dest_path
      }]
    }
  }

  // Project configuration.
  grunt.initConfig(G_options);

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-browserify');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'browserify', 'concat', 'uglify', 'less']);
};
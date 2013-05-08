module.exports = function(grunt) {

  var files = {
    common: ['public/js/common/*.js', 'public/js/common/**/*.js'],
    vendor_common: ['public/js/vendor/common/*.js'],
    vendor_webgl: ['public/js/vendor/webgl/*.js'],
    vendor_mapmaker: ['public/js/vendor/mapmaker/*.js'],
    game: ['public/js/game/*.js'],
    home: ['public/js/home/*.js']
  };
  var JSHintFiles = files.common.concat(files.game, files.home);

  var options = {
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';\n\n'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      common: {
        src: 'public/dist/common.js',
        dest: 'public/dist/common.min.js'
      },
      game: {
        src: 'public/dist/game.js',
        dest: 'public/dist/game.min.js'
      },
      home: {
        src: 'public/dist/home.js',
        dest: 'public/dist/home.min.js'
      }
    },
    jshint: {
      // define the files to lint
      files: JSHintFiles, //['public/js/common/*.js', 'public/js/vendor/*.js', 'public/js/game/*.js'],
      // configure JSHint (documented at http://www.jshint.com/docs/)
      options: {
        onecase: true,
        // more options here if you want to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'concat']
    }
  };


  function addConcatModule(name) {
    options.concat[name] = {
      src: files[name],
      dest: 'public/dist/' + name + '.js'
    };
  }


  addConcatModule('common');
  addConcatModule('game');
  addConcatModule('home');
  addConcatModule('vendor_common');
  addConcatModule('vendor_mapmaker');
  addConcatModule('vendor_webgl');

  // Project configuration.
  grunt.initConfig(options);

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'concat', 'uglify']);

};
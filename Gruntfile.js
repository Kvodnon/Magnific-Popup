/**
 * 
 * Run 'grunt' to generate JS and CSS in folder 'dist' and site in folder '_site'
 *
 * Run `grunt production` to generate production site in folder '_production_site'
 *
 * Run 'grunt watch' to automatically regenerate '_site' when you change files in 'src' or in 'website'
 * 
 */

module.exports = function(grunt) {

  'use strict';

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('magnific-popup.jquery.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    clean: {
      files: ['dist']
    },
    sass: {                            
      dist: {                      
        files: {      
          'dist/magnific-popup.css': 'src/css/main.scss'
        }
      }
    },

    jshint: {
      all: ['Gruntfile.js', 'src/js/*.js'],
      options: {
        "curly": false,
        "eqeqeq": true,
        "immed": true,
        "latedef": true,
        "newcap": true,
        "noarg": true,
        "sub": true,
        "undef": false,
        "unused": true,
        "boss": true,
        "eqnull": true,
        "browser": true,

        "predef": [
          "jQuery",
          "define",
          "module",
          "console",
          "mfp",
          "$"
        ]
      }

    },


    mfpbuild: {
      all: {
        src: [
          'inline',
          'ajax',
          'image',
          'iframe',
          'gallery',
          'retina',
          'fastclick'
        ],
        basePath: 'src/js/',
        dest: 'dist/jquery.magnific-popup.js',
        banner: '<%= banner %>'
      }
    },
    jekyll: {
      dev: {
        src: 'website',
        dest: '_site',
        url: 'local'
      },
      production: {
        src: 'website',
        dest: '_production',
        url: 'production'
      }
    },

    copy: {
      main: {
        files: [
          {src: ['dist/**'], dest: 'website/'}
        ]
      },
      dev: {
        files: [
          {src: ['dist/**'], dest: '_site/'}
        ]
      }
    },

    uglify: {
      my_target: {
        files: {
          'dist/jquery.magnific-popup.min.js': ['dist/jquery.magnific-popup.js']
        }
      }
    },

    watch: { // for development run 'grunt watch'
      jekyll: {
        files: ['website/**'],
        tasks: ['jekyll:dev', 'copy:dev']
      },
      files: ['src/**'],
      tasks: [ 'sass', 'mfpbuild', 'copy:dev', 'uglify']
    },

    cssmin: {
      compress: {
        files: {
          "website/site-assets/all.min.css": ["website/site-assets/site.css", "website/dist/magnific-popup.css"]
        }
      }
    }



  });


  // Makes Magnific Popup JS file.
  // grunt mfpbuild --mfp-exclude=ajax,image
  grunt.task.registerMultiTask('mfpbuild', 'Makes Magnific Popup JS file.', function() {

    var files = this.data.src,
        includes = grunt.option('mfp-exclude'),
        basePath = this.data.basePath,
        newContents = this.data.banner + ";(function($) {\n";


    if(includes) {
      includes = includes.split(/[\s,]+/); // 'a,b,c' => ['a','b','c']
      var removeA = function (arr) {
          var what, a = arguments, L = a.length, ax;
          while (L > 1 && arr.length) {
              what = a[--L];
              while ((ax= arr.indexOf(what)) !== -1) {
                  arr.splice(ax, 1);
              }
          }
          return arr;
      };

      includes.forEach(function( name ) {
        if(name) {
           
           grunt.log.writeln( 'removed "'+name +'"' );
           files = removeA(files, name);
         }
      });
    }
    
    files.unshift('core');

    grunt.log.writeln( 'Your build is made of:'+files );

    files.forEach(function( name ) {
      // Wrap each module with a pience of code to be able to exlude it, stolen for modernizr.com
      newContents += "\n/*>>"+name+"*/\n"; 
      newContents += grunt.file.read( basePath + name + '.js' ) + '\n';
      newContents += "\n/*>>"+name+"*/\n"; 
    });
    newContents+= "})(window.jQuery || window.Zepto);";

    grunt.file.write( this.data.dest, newContents );
  });


  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');


  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-jekyll');
   grunt.loadNpmTasks('grunt-contrib-cssmin');

  // Default task.
  grunt.registerTask('default', ['sass', 'mfpbuild', 'uglify', 'copy', 'jekyll:dev']);


 grunt.registerTask('production', ['sass', 'mfpbuild', 'uglify', 'copy', 'cssmin', 'jekyll:production']);
 
 grunt.registerTask('hint', ['jshint']);

};

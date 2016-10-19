/* jshint node: true */

module.exports = function (grunt) {
  "use strict";

  grunt.initConfig({
      pkg: grunt.file.readJSON('package.json')
    , jshint: {
        all: [
            "Gruntfile.js"
          , "src/js/models/*.js"
          , "src/js/views/*.js"
          , "src/js/app.js"
        ]
      , options: {
          jshintrc: '.jshintrc'
        },
    },
    // jasmine: {
    //     src: [
    //         "omero_figure/static/figure/3rdparty/jquery-1.7.2.js",
    //         "omero_figure/static/figure/3rdparty/underscore.js",
    //         "omero_figure/static/figure/3rdparty/backbone.js",
    //         "omero_figure/static/figure/js/*.js"
    //     ]
    //   , options: {
    //       specs: "spec/*.js"
    //     // , vendor: "vendor/**/*.js"
    //   }
    // },
    jst: {
      compile: {
        files: {
          "omero_figure/static/figure/templates.js": [
            "src/templates/*.html",
            "src/templates/**/*.html"
          ]
        }
      }
    },
    watch: {
      src: {
        // we compile html templates with 'jst'
        files: [
            'src/templates/*.html',
            'src/templates/**/*.html'
        ],
        tasks: ['jst']
      },
      scripts: {
        // and concatonate js files into a single figure.js
        files: [
            'src/js/models/*.js',
            'src/js/views/*.js',
            'src/js/app.js'
        ],
        tasks: ['concat']
      },
    },
    concat: {
      options: {
                banner: "//! GPL License. www.openmicroscopy.org\n\n" +
                    "//!  DO NOT EDIT THIS FILE! - Edit under static/figure/js/\n" +
                    "//!  figure.js created by $ grunt concat\n\n",
      },
      js: {
        src: [
            "<banner>",
            'src/js/models/*.js',
            'src/js/views/*.js',
            'src/js/app.js'],
        dest: 'omero_figure/static/figure/figure.js',
      },
    },
    replace: {
      dist: {
        options: {
          patterns: [
            {
              json: {
                '{{ version }}': '<%= pkg.version %>',
                '{% load url from future %}': '',
                '$.get("{% url \'keepalive_ping\' %}");': '',
                '{% include "webgateway/base/includes/script_src_jquery.html" %}':
                    '<script type="text/javascript" src="//code.jquery.com/jquery-1.7.2.min.js"></script>',
                '{% include "webgateway/base/includes/jquery-ui.html" %}':
                    '<script type="text/javascript" src="//code.jquery.com/ui/1.8.19/jquery-ui.js"></script>' +
                    '<link rel="stylesheet" href="//code.jquery.com/ui/1.8.19/themes/smoothness/jquery-ui.css" type="text/css" />',
                "{% url 'figure_index' %}":
                    "",
                "{% url 'save_web_figure' %}":
                    "/figure/save_web_figure/",
                "{% url 'list_web_figures' %}":
                    "static/json/list_web_figures.json",
                "{% static '":
                    "static/",
                "' %}":
                    "",
                '{{ userFullName }}':
                    'Will Moore',
                '{% if scriptMissing %}disabled="disabled"{% endif %}':
                    'disabled="disabled"',
                '<li class="save_as">':
                    '<li class="save_as disabled">',
                "if (this.model.get('fileId')) {":    // disables 'Delete'
                    "if (false) {",
                '{% now "Y" %}':
                    '<%= new Date().getFullYear() %>',
                "{% url 'webindex' %}":
                    "http://figure.openmicroscopy.org/",
                'title="Back to OMERO.webclient"':
                    'title="Back to figure.openmicroscopy.org"',
                "{% static 'figure/figure.js' %}": 'figure.js',
                // in figure.js
                'if (figureModel.get("unsaved")) {':
                    'if (false) {',
                '{pushState: true, root: BASE_WEBFIGURE_URL}':
                    '',
                'BASE_WEBFIGURE_URL.length) === BASE_WEBFIGURE_URL':
                    "8) === '/figure/'",
                'href = href.replace(BASE_WEBFIGURE_URL, "/");':
                    "href = href.replace('/figure', '');",
                'json.url = BASE_WEBFIGURE_URL + "file/" + json.id;':
                    'json.url = "#file/" + json.id;',
                'load_web_figure/" + fileId + "/"' :
                    'static/json/load_web_figure/" + fileId + ".json"',
                "'canEdit': true,":
                    "'canEdit': false,"
                }
            }
          ],
          usePrefix: false,
        },
        files: [
          {
              expand: true,
              flatten: true,
              src: [
                  'omero_figure/templates/figure/index.html',
                  'omero_figure/static/figure/figure.js'
              ], dest: 'demo/'}
        ]
      }
    },
    copy: {
      main: {
        files: [
          {
            expand: true,
            src: ['omero_figure/static/figure/3rdparty/**',
                  'omero_figure/static/figure/css/**',
                  'omero_figure/static/figure/images/**',
                  'omero_figure/static/figure/templates.js'], dest: 'demo/'},
        ]
      },
    },
  })

  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-contrib-jasmine')
  grunt.loadNpmTasks('grunt-contrib-jst');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('test', ['jshint', 'jasmine'])
  grunt.registerTask('default', ['test'])

  // create a static 'demo' version of app
  // creates demo/index.html and demo/figure.js via 'replace' command
  // then copies over other static js, css and images to demo/static/figure/..
  grunt.registerTask('demo', [
      'concat', 'replace', 'copy'
  ]);
};

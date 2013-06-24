/*global module:false*/
module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: grunt.file.readJSON('package.json'),
		banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
			' License: <%= pkg.license %> */\n',
		// Task configuration.
		concat: {
			options: {
			banner: '/* Web Experience Toolkit (WET) / Boîte à outils de l\'expérience Web (BOEW) wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt */\n',
			stripBanners: true
			},
			vapour: {
				src: [ 'lib/modernizr/modernizr.js','src/core/vapour/vapour.js'],
				dest: 'build/js/vapour.js'
			},
			wetboew: {
				src: [ 'src/plugins/**/*.js'],
				dest: 'build/js/wet-boew.js'
			},

		},
		sass: {
			build: {
				/* options: {
					outputStyle: 'expanded' ## Currently libsass has a bug with the property outputStyle [https://github.com/andrew/node-sass]
				}, */
				files: {
					'build/css/base.css': 'src/sass/base.scss',
					'themes/bare/css/theme.css': 'themes/bare/css/theme.scss',
					'themes/demo/css/theme.css': 'themes/demo/css/theme.scss',
					//'dist/css/theme.css': 'themes/demo/css/theme.scss'
				}
			}
		},
		uglify: {
			jquery : {
				options: {
					banner : '/*! jQuery v1.9.1 | (c) 2005, 2012 jQuery Foundation, Inc. | jquery.org/license */\n'
				},
				files : {
					'build/js/vendor/jquery-1.9.1.min.js': ['lib/jquery/jquery-1.9.1.js']
				}
			},
			jquery2 : {
				options: {
					banner : '/*! jQuery v2.0.2 | (c) 2005, 2012 jQuery Foundation, Inc. | jquery.org/license */\n'
				},
				files : {
					'build/js/vendor/jquery-2.0.2.min.js': ['lib/jquery/jquery-2.0.2.js']
				}
			},
			selectivizr : {
				options: {
					banner : '/*!* selectivizr v1.0.2 - (c) Keith Clark, freely distributable under the terms of the MIT license. * selectivizr.com */\n'
				},
				files : {
					'build/js/vendor/selectivizr.min.js': ['lib/selectivizr/selectivizr.js']
				}
			},
			jqm: {
				options: {
					banner : '/*! jQuery Mobile Git HEAD hash: 74b4bec049fd93e4fe40205e6157de16eb64eb46 <> Date: Wed Apr 10 2013 21:57:23 UTC jquerymobile.com | jquery.org/license */\n'
				},
				files: {
					'build/js/vendor/jquery-mobile-1.3.1.min.js': ['lib/jquery.mobile/jquery.mobile-1.3.1.js']
				}
			},
			polyfills: {
				options: {
					preserveComments : 'some'
				},
				files: {
					'build/js/polyfills/datalist.min.js': ['src/core/vapour/polyfills/datalist.js'],
					'build/js/polyfills/respond.min.js': ['src/core/vapour/polyfills/respond.js'],
					'build/js/polyfills/excanvas.min.js': ['src/core/vapour/polyfills/excanvas.js'],
					'build/js/polyfills/datepicker.min.js': ['src/core/vapour/polyfills/datepicker.js'],
					'build/js/polyfills/detailssummary.min.js': ['src/core/vapour/polyfills/detailssummary.js'],
					'build/js/polyfills/localstorage.min.js': ['src/core/vapour/polyfills/localstorage.js'],
					'build/js/polyfills/meter.min.js': ['src/core/vapour/polyfills/meter.js'],
					'build/js/polyfills/progress.min.js': ['src/core/vapour/polyfills/progress.js'],
					'build/js/polyfills/sessionstorage.min.js': ['src/core/vapour/polyfills/sessionstorage.js'],
					'build/js/polyfills/slider.min.js': ['src/core/vapour/polyfills/slider.js']
					}
			},
			vapour: {
				options: {
					banner: '/* Web Experience Toolkit (WET) / Boîte à outils de l\'expérience Web (BOEW) wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt */\n'
				},
				files: {
					'build/js/vapour.min.js': ['lib/modernizr/modernizr.js', 'src/core/vapour/vapour.js']
				}
			},
			 wetboew: {
				options: {
						banner: '/* Web Experience Toolkit (WET) / Boîte à outils de l\'expérience Web (BOEW) wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt */'
				},
				files: {
						'build/js/wet-boew.min.js': ['build/js/wet-boew.js']
			 	}
			}
		},
		coffee: {
			compileBare: {
                options: {
                    bare: true
                },
                files: [
                    { 'dist/core/vapour/vapour.js': 'src/core/vapour/vapour.coffee' }, // 1:1 compile
                   // { 'plugins/bare/wet-boew-plugin.bare.js': 'src/plugins/bare/wet-boew-plugin.coffee' }
                    { 'dist/plugins/zebra/wet-boew.zebra.js': 'src/plugins/zebra/wet-boew-plugin-zebra.coffee' },
				    { 'src/plugins/equalize/wet-boew.equalize.js': 'src/plugins/equalize/wet-boew-plugin-equalize.coffee' },
				    { 'src/plugins/dimensions/wet-boew.dimensions.js': 'src/plugins/dimensions/wet-boew-plugin-dimensions.coffee' }
				]
			}
		},
		copy: {

			main : {
				files : [
					{expand: true, cwd: 'build/', src: ['**'], dest: 'dist/bare/'},
					{expand: true, cwd: 'themes/bare/', src: ['*.css'], dest: 'dist/bare/css/'},
					{expand: true, cwd: 'themes/bare/', src: ['*.html'], dest: 'dist/bare/'},
					{expand: true, cwd: 'build/', src: ['**'], dest: 'dist/demo/'},
					{expand: true, cwd: 'themes/demo/', src: ['*.html'], dest: 'dist/demo/'},
					{expand: true, cwd: 'themes/demo/css/', src: ['*.css'], dest: 'dist/demo/css/'}
				]
			}
		},

		clean: ["dist", "build"],
		watch: {
			gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
			},
			lib_test: {
                files: '<%= jshint.lib_test.src %>',
                tasks: ['jshint:lib_test', 'qunit']
			}
		}
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-coffee');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-sass');

	// Default task.
	grunt.registerTask('build', ['coffee']);
	grunt.registerTask('default', ['clean','coffee','sass','concat','uglify', 'copy']);
	grunt.registerTask('generic', ['clean','coffee','sass','concat','uglify', 'copy']);

};

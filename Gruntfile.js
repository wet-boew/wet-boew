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
				dest: 'dist/js/vapour.js'
			},
			wetboew: {
				src: [ 'src/plugins/**/*.js'],
				dest: 'dist/js/wet-boew.js'
			}
		},
		sass: {
			base: {
				'dist/css/base.css': 'src/sass/base.scss'
			},
			bare: {
				'demos/vapour/bare/css/theme.css': 'themes/bare/css/theme.scss'
			},
			demo: {
				'demos/vapour/demo/css/theme.css': 'themes/demo/css/theme.scss'
			}
		},
		uglify: {
			selectivizr : {
				options: {
					banner : '/*!* selectivizr v1.0.2 - (c) Keith Clark, freely distributable under the terms of the MIT license. * selectivizr.com */\n'
				},
				files : {
					'dist/js/vendor/selectivizr.min.js': ['lib/selectivizr/selectivizr.js']
				}
			},
			jqm: {
				options: {
					banner : '/*! jQuery Mobile Git HEAD hash: 74b4bec049fd93e4fe40205e6157de16eb64eb46 <> Date: Wed Apr 10 2013 21:57:23 UTC jquerymobile.com | jquery.org/license */\n'
				},
				files: {
					'dist/js/vendor/jquery-mobile-1.3.1.min.js': ['lib/jquery.mobile/jquery.mobile-1.3.1.js']
				}
			},
			polyfills: {
				options: {
					preserveComments : 'some'
				},
				files: {
					'dist/js/polyfills/datalist.min.js': ['src/core/vapour/polyfills/datalist.js'],
					'dist/js/polyfills/respond.min.js': ['src/core/vapour/polyfills/respond.js'],
					'dist/js/polyfills/excanvas.min.js': ['src/core/vapour/polyfills/excanvas.js'],
					'dist/js/polyfills/datepicker.min.js': ['src/core/vapour/polyfills/datepicker.js'],
					'dist/js/polyfills/detailssummary.min.js': ['src/core/vapour/polyfills/detailssummary.js'],
					'dist/js/polyfills/localstorage.min.js': ['src/core/vapour/polyfills/localstorage.js'],
					'dist/js/polyfills/meter.min.js': ['src/core/vapour/polyfills/meter.js'],
					'dist/js/polyfills/progress.min.js': ['src/core/vapour/polyfills/progress.js'],
					'dist/js/polyfills/sessionstorage.min.js': ['src/core/vapour/polyfills/sessionstorage.js'],
					'dist/js/polyfills/slider.min.js': ['src/core/vapour/polyfills/slider.js']
					}
			},
			vapour: {
				options: {
					banner: '/* Web Experience Toolkit (WET) / Boîte à outils de l\'expérience Web (BOEW) wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt */\n'
				},
				files: {
					'dist/js/vapour.min.js': ['lib/modernizr/modernizr.js', 'src/core/vapour/vapour.js']
				}
			},
			wetboew: {
				options: {
					banner: '/* Web Experience Toolkit (WET) / Boîte à outils de l\'expérience Web (BOEW) wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt */'
				},
				files: {
					'dist/js/wet-boew.min.js': ['dist/js/wet-boew.js']
				}
			}
		},
		coffee: {
			compileBare: {
				options: {
					bare: true
				},
				files: [
					{
						'dist/core/vapour/vapour.js': 'src/core/vapour/vapour.coffee'
					}, // 1:1 compile
					{
						'dist/plugins/zebra/wet-boew.zebra.js': 'src/plugins/zebra/wet-boew-plugin-zebra.coffee'
					},
					{
						'dist/plugins/equalize/wet-boew.equalize.js': 'src/plugins/equalize/wet-boew-plugin-equalize.coffee'
					},
					{
						'dist/plugins/dimensions/wet-boew.dimensions.js': 'src/plugins/dimensions/wet-boew-plugin-dimensions.coffee'
					}
				]
			}
		},
		jade: {
			html: {
				options: {
					pretty: true
				},
				files: [{
					expand: true,
					cwd: 'themes',
					dest: 'themes',
					src: '**/*.jade',
					ext: '.html'
				}]
			}
		},
		copy: {
			main: {
				files: [
					{expand: true, cwd: 'dist/', src: ['**'], dest: 'dist/bare/'},
					{expand: true, cwd: 'themes/bare/', src: ['*.css'], dest: 'dist/bare/css/'},
					{expand: true, cwd: 'themes/bare/', src: ['*.html'], dest: 'dist/bare/'},
					{expand: true, cwd: 'src/sass/images/icons/', src: ['**'], dest: 'dist/bare/css/images/icons'},
					{expand: true, cwd: 'dist/', src: ['**'], dest: 'dist/demo/'},
					{expand: true, cwd: 'themes/demo/', src: ['*.html'], dest: 'dist/demo/'},
					{expand: true, cwd: 'themes/demo/css/', src: ['*.css'], dest: 'dist/demo/css/'},
					{expand: true, cwd: 'src/sass/images/icons/', src: ['**'], dest: 'dist/demo/css/images/icons'}
				]
			},
			jquery: {
				files: [{
					cwd: 'lib/jquery',
					src: '*.js',
					dest: 'dist/js/vendor',
					expand: true
				}]
			}
		},

		clean: [
			'dist'
		],
		watch: {
			gruntfile: {
				files: '<%= jshint.gruntfile.src %>',
				tasks: ['jshint:gruntfile']
			},
			lib_test: {
				files: '<%= jshint.lib_test.src %>',
				tasks: ['jshint:lib_test', 'qunit']
			},
			source: {
				files: '<%= jshint.lib_test.src %>',
				tasks: ['build'],
				options: {
					interval: 5007,
					livereload: true
				}
			}
		},
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				unused: true,
				boss: true,
				eqnull: true,
				browser: true,
				globals: {
					jQuery: true
				}
			},
			gruntfile: {
				src: 'Gruntfile.js'
			},
			lib_test: {
				src: [
					'src/**/*.js',
					'!src/**/*min.js',
					'!src/js/polyfills/datalist.js',
					'!src/js/polyfills/html5shiv.js',
					'!src/js/dependencies/bookmark.js',
					'!src/js/dependencies/browsertweaks.js',
					'!src/js/dependencies/colorbox.js',
					'!src/js/dependencies/easytabs.js',
					'!src/js/dependencies/hashchange.js',
					'!src/js/dependencies/hoverintent.js',
					'!src/js/dependencies/json.js',
					'!src/js/dependencies/matchMedia.js',
					'!src/js/dependencies/metadata.js',
					'!src/js/dependencies/outside.js',
					'!src/js/dependencies/pie.js',
					'!src/js/dependencies/prettify.js',
					'!src/js/dependencies/prettify/**/*.js',
					'!src/js/dependencies/raphael.js',
					'!src/js/dependencies/resize.js',
					'!src/js/dependencies/validate.js',
					'!src/js/dependencies/validateAdditional.js',
					'!src/js/dependencies/xregexp.js',
					'!src/js/dependencies/proj4js.js',
					'!src/js/dependencies/openlayers.js',
					'!src/core/vapour/polyfills/excanvas.js',
					'!src/core/vapour/polyfills/sessionstorage.js',
					'!src/core/vapour/polyfills/slider.js',
					'!src/core/vapour/polyfills/localstorage.js',
					'!src/core/vapour/polyfills/detailssummary.js',
					'test/**/*.js'
				]
			}
		},
		connect: {
			server: {
				options: {
					port: 8000,
					base: '.'
				}
			}
		}
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-coffee');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-sass');

	// Default task.
	grunt.registerTask('build', ['coffee','jade','sass','concat','uglify', 'copy']);
	grunt.registerTask('test', ['jshint']);
	grunt.registerTask('default', ['clean', 'build', 'test']);
	grunt.registerTask('server', ['connect','watch:source']);
};

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
			dist: {
			src: [ 'lib/modernizr/modernizr.js','src/core/vapour/vapour.js'],
			dest: 'dist/js/vapour.js'
			}
		},
		uglify: {
			jquery : {
				options: {
					banner : '/*! jQuery v1.9.1 | (c) 2005, 2012 jQuery Foundation, Inc. | jquery.org/license */\n'
				},
				files : {
					'dist/js/vendor/jquery-1.9.1.min.js': ['lib/jquery/jquery-1.9.1.js']
				}
			},
			jqm: {
				options: {
					banner : '/*! jQuery Mobile vGit Build: SHA1: caa77b258660731d663844fe7867aa2c3a107ab1 <> Date: Wed Feb 20 15:03:27 2013 -0500 jquerymobile.com | jquery.org/license */\n'
				},
				files: {
					'dist/js/vendor/jquery-mobile-1.3.0.min.js': ['lib/jquery.mobile/jquery.mobile-1.3.0.js']
				}
			},
			polyfills: {
				options: {
					preserveComments : 'some'
				},
				files: {
					'dist/js/polyfills/datalist.min.js': ['src/core/vapour/polyfills/datalist.js'],
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
			}
			// wetboew: {
			//		options: {
			////		banner: '/* Web Experience Toolkit (WET) / Boîte à outils de l\'expérience Web (BOEW) wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt */'
			//	},
			//	files: {
			//	 'dist/js/wet-boew.min.js': ['src/plugins/*.js']
			 //	}
			// }
		},
		coffee: {
			compileBare: {
                options: {
                    bare: true
                },
                files: [
                    { 'src/core/vapour/vapour.js': 'src/core/vapour/vapour.coffee' }, // 1:1 compile
                    { 'plugins/bare/wet-boew-plugin.bare.js': 'plugins/bare/wet-boew-plugin.coffee' } 
                ]
			}
		},
		copy: {
			dist: [
                { 
                    src: ['lib/jquery/jquery-1.9.1.min.js'],
                    dest: 'dist/vendor/', filter: 'isFile'
                },
                {
                    src: ['lib/jquery.mobile/*min.js'],
                    dest: 'dist/vendor/', filter: 'isFile'
                }
			 ]
		},

		clean: ["dist"],
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

	// Default task.
	grunt.registerTask('build', ['coffee']);
	grunt.registerTask('default', ['clean','coffee','concat','uglify']);
	grunt.registerTask('generic', ['clean','coffee','concat','uglify']);

};

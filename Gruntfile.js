/*global module:false*/
module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: grunt.file.readJSON('package.json'),
		banner: '/*! Web Experience Toolkit (WET) / Boîte à outils de l\'expérience Web (BOEW) wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt\n' +
			' - v<%= pkg.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
			' License: <%= pkg.license %> */\n',
		// Task configuration.
		concat: {
			options: {
				banner: '<%= banner %>'
			},
			plugins: {
				options: {
					stripBanners: true
				},
				src: ['dist/js/wet-boew.js', 'src/plugins/**/*.js'],
				dest: 'dist/js/wet-boew.js',
			},
			core: {
				options: {
					stripBanners: false
				},
				src: ['lib/modernizr/modernizr-custom.js', 'dist/js/vapour.js'],
				dest: 'dist/js/vapour.js',
			}
		},
		assemble: {
			options: {
				prettify: {indent: 2},
				marked: {sanitize: false},
				production: false,
				data: 'src/templates/data/*.yml',
				assets: 'dist/assets',
				helpers: 'src/helpers/helper-*.js',
				layoutdir: 'src/templates/layouts',
				partials: ['src/templates/includes/**/*.hbs']
			},
			site: {
				options: {
					layout: 'default.hbs'
				},
				expand: true,
				cwd: 'src/templates/pages',
				src: ['*.hbs'],
				dest: 'dist/'
			},
			plugins: {
				options: {
					layout: 'plugins.hbs'
				},
				expand: true,
				cwd: 'src/plugins',
				src: ['**/*.hbs'],
				dest: 'dist/demo/',
				flatten: true
			}
		},
		sass: {
			all: {
				expand: true,
				cwd: 'src/base',
				src: ['**/*.scss', '!**/_*.scss'],
				dest: 'dist/css/',
				ext: '.css'
			}
		},
		uglify: {
			polyfills: {
				options: {
					preserveComments : 'some'
				},
				expand: true,
				cwd: 'src/polyfills',
				src: ['**/*.js'],
				dest: 'dist/js/polyfills/',
				ext: '.min.js',
				flatten: true
			},
			core: {
				options: {
					preserveComments : 'some'
				},
				files: {
					'dist/js/vapour.min.js': 'dist/js/vapour.js'
				}
			},
			plugins: {
				options: {
					banner: '<%= banner %>'
				},
				files: {
					'dist/js/wet-boew.min.js': 'dist/js/wet-boew.js'
				}
			},
			i18n: {
				options: {
					banner: '<%= banner %>'
				},
				expand: true,
				cwd: 'dist/js/i18n',
				src: ['**/*.js'],
				dest: 'dist/js/i18n',
				ext: '.min.js'
			},
			lib: {
				options: {
					preserveComments : 'some'
				},
				files: {
					'dist/js/deps/jquery.pjax.min.js': 'lib/pjax/jquery.pjax.js'
				}
			}

		},
		coffee: {
			vapour: {
				options: {
					bare: true,
				},
				files: {
					'dist/js/vapour.js': 'src/core/vapour.coffee'
				}
			},
			plugins: {
				options: {
					bare: true
				},
				files: {
					'dist/js/wet-boew.js': ['src/core/helpers.coffee','src/plugins/**/*.coffee']
				}
			}

		},
		modernizr: {
			// [REQUIRED] Path to the build you're using for development.
			"devFile" : "lib/modernizr/modernizr-custom.js",
			// By default, source is uglified before saving
			"uglify" : true,
			// [REQUIRED] Path to save out the built file.
			"outputFile" : "lib/modernizr/modernizr-custom.js",
			// Based on default settings on http://modernizr.com/download/
			"extra" : {
				"shiv" : true,
				"printshiv" : false,
				"load" : true,
				"mq" : true,
				"css3": true,
				"input": true,
				"inputtypes": true,
				"html5": true,
				"cssclasses" : true,
				"fontface": true,
				"backgroundsize" : true,
				"borderimage" : true,
				// continue with all tests
			},
			// Based on default settings on http://modernizr.com/download/
			"extensibility" : {
				"addtest" : false,
				"prefixed" : false,
				"teststyles" : true,
				"testprops" : true,
				"testallprops" : true,
				"hasevents" : true,
				"prefixes" : true,
				"domprefixes" : true
			},
			// Define any tests you want to impliticly include.
			"tests" : [],
			// By default, this task will crawl your project for references to Modernizr tests.
			// Set to false to disable.
			"parseFiles" : false,
			// When parseFiles = true, this task will crawl all *.js, *.css, *.scss files, except files that are in node_modules/.
			// You can override this by defining a "files" array below.
			// "files" : [],
			// When parseFiles = true, matchCommunityTests = true will attempt to
			// match user-contributed tests.
			"matchCommunityTests" : false,
			// Have custom Modernizr tests? Add paths to their location here.
			"customTests" : []
		},
		copy: {
			jquery: {
				files: [{
					cwd: 'lib/jquery',
					src: ['jquery.min.js', 'jquery.min.map'],
					dest: 'dist/js',
					expand: true
				}]
			},
			oldie: {
				cwd: 'lib/oldie',
				src: [
					'jquery/jquery.min.js',
					'jquery/jquery.min.map',
					'selectivizr.js', //TODO: Minify
					'respond/respond.min.js'
					],
				dest: 'dist/js/oldie',
				expand: true,
				flatten: true
			},
			bootstrap: {
				files: {
					'dist/css/bootstrap.min.css': 'lib/bootstrap/dist/css/bootstrap.min.css'
				}
			}
		},

		clean: [
			'dist'
		],
		watch: {
			gruntfile: {
				files: '<%= jshint.gruntfile.src %>',
				tasks: ['jshint:gruntfile', 'build']
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
					'!src/polyfills/**/*.js',
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
		},
		bowerful: {
			dist: {
				packages: {
					bootstrap: '3.0.0',
					jquery: '2.0.3',
					"jquery.validation": '1.11.1',
					flot: '0.8.1',
					DataTables: '1.9.4',
					'magnific-popup': '0.9.5',
					'jquery-pjax': '1.7.3'
				},
				store: 'lib',
			},
			oldie: {
				packages: {
					jquery: '1.10.2',
					respond: '1.2.0',
					selectivizr: '1.0.2'
				},
				store: 'lib/oldie',
			}
		},
		i18n: {
			options: {
				template: 'src/i18n/base.js',
				csv: 'src/i18n/i18n.csv'
			},
			src: 'src/js/i18n/formvalid/*.js'
		}
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-coffee');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-bowerful');
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks("grunt-modernizr");
	grunt.loadNpmTasks("assemble");
	grunt.loadTasks('tasks');

	// Default task.
	grunt.registerTask('build', ['coffee','sass','concat', 'i18n', 'uglify', 'copy', 'assemble']);
	grunt.registerTask('test', ['jshint']);
	grunt.registerTask('html', ['assemble']);
	grunt.registerTask('default', ['clean', 'build', 'test']);
	grunt.registerTask('server', ['connect','watch:source']);
	grunt.registerTask('init', ['bowerful', 'modernizr']);
};

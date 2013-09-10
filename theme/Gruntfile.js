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
		clean: {
			dist: {
				src: ['dist/theme']
			},
			non_mincss: {
				src: [
					'dist/**/*.css',
					'!dist/**/*.min.css'
				]
			}
		},
		uglify: {
			theme: {
				options: {
					banner: '<%= banner %>'
				},
				files: {
					'dist/theme/js/theme.min.js': ['js/theme.js']
				}
			}
		},
		sass: {
			dist: {
				files: {
					'dist/theme/css/theme.css': 'sass/theme.scss'
				}
			}
		},
		cssmin: {
			dist: {
				cwd: 'dist/theme',
				src: ['**/css/*.css'],
				dest: 'dist/theme',
				ext: '.min.css',
				expand: true
			}
		},
		assemble:{
			options: {
				prettify: {indent: 2},
				marked: {sanitize: false},
				production: false,
				layoutdir: 'layouts',
				data: ['config/**/*.json'],
				assets: 'dist/',
				partials: ['includes/**/*.hbs']
			},
			static: {
				options: {
					layout: 'theme.hbs'
				},
				src: ['*.hbs'],
				dest: 'dist/theme/'
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
					'js/*.js',
				]
			}
		},
		copy: {
			dist: {
				expand: true,
				src: 'assets/*',
				dest: 'dist/theme/'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('assemble');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	//TODO: Replace by dependency management
	grunt.registerTask('pkg', ['copy']);

	grunt.registerTask('dist-js', ['uglify']);
	grunt.registerTask('dist-css', ['sass', 'cssmin', 'clean:non_mincss']);
	grunt.registerTask('dist', ['clean','dist-js','dist-css', 'copy', 'html']);
	grunt.registerTask('html', ['assemble']);
	grunt.registerTask('test', ['jshint']);
	grunt.registerTask('default', ['test', 'dist']);
};

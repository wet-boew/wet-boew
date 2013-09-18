module.exports = (grunt) ->

	grunt.util.linefeed = "\n"
	# Project configuration.
	grunt.initConfig

		# Metadata.
		pkg: grunt.file.readJSON("package.json")
		banner: "/*! Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW) wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html\n" +
				" - v<%= pkg.version %> - " + "<%= grunt.template.today(\"yyyy-mm-dd\") %>\n*/\n"
		environment:
			suffix: if grunt.cli.tasks.indexOf('debug') > -1 then "" else ".min"

		# Task configuration.
		concat:
			options:
				banner: "<%= banner %>"

			plugins:
				options:
					stripBanners: true
				src: [
					"dist/js/wet-boew.js",
					"src/plugins/**/*.js"
				]
				dest: "dist/js/wet-boew.js"

			core:
				options:
					stripBanners: false
				src: [
					"lib/modernizr/modernizr-custom.js",
					"dist/js/vapour.js"
				]
				dest: "dist/js/vapour.js"

		# Builds the demos
		assemble:
			options:
				prettify:
					indent: 2
				marked:
					sanitize: false
				production: false
				data: "site/data/**/*.{yml,json}"
				assets: "dist"
				helpers: "site/helpers/helper-*.js"
				layoutdir: "site/layouts"
				partials: ["site/includes/**/*.hbs"]

			site:
				options:
					layout: "default.hbs"
					environment:
						suffix: "<%= environment.suffix %>"
				expand: true
				cwd: "src"
				src: ["*.hbs"]
				dest: "dist/"

			demo:
				options:
					layout: "default.hbs"
					environment:
						suffix: "<%= environment.suffix %>"
				expand: true
				cwd: "src/plugins"
				src: ["**/*.hbs"]
				dest: "dist/demo"

		# Comiles the Sass files
		sass:
			options:
				browsers: [
					"last 2 versions,",
					"ff >= 17",
					"opera 12.1",
					"bb >= 7",
					"android >= 2.3",
					"ie >= 8",
					"ios 5"
				]
			all:
				expand: true
				cwd: "src/base"
				src: ["**/*.scss", "!**/_*.scss"]
				dest: "dist/css/"
				ext: ".css"

		autoprefixer:
			all:
				cwd: "dist/css"
				src: [
					"**/*.css",
					"!**/*.min.css"
				]
				dest: "dist/css"
				expand: true
				flatten: true

		# Minifiy
		uglify:
			polyfills:
				options:
					preserveComments: "some"
				expand: true
				cwd: "dist/js/polyfills/"
				src: ["*.js"]
				dest: "dist/js/polyfills/"
				ext: "<%= environment.suffix %>.js"

			core:
				options:
					preserveComments: "some"
				files:
					"dist/js/vapour<%= environment.suffix %>.js": "dist/js/vapour.js"

			plugins:
				options:
					banner: "<%= banner %>"
				files:
					"dist/js/wet-boew<%= environment.suffix %>.js": "dist/js/wet-boew.js"

			i18n:
				options:
					banner: "<%= banner %>"
				expand: true
				cwd: "dist/js/i18n"
				src: ["**/*.js"]
				dest: "dist/js/i18n"
				ext: "<%= environment.suffix %>.js"

			deps:
				options:
					preserveComments: "some"
				expand: true
				cwd: "dist/js/deps"
				src: ["*.js"]
				dest: "dist/js/deps"
				ext: "<%= environment.suffix %>.js"

		cssmin:
			options:
				banner: "<%= banner %>"
			dist:
				expand: true
				cwd: "dist/css"
				src: ["**/*.css", "!**/*.min.css"]
				dest: 'dist/css'
				ext: "<%= environment.suffix %>.css"

		coffee:
			vapour:
				options:
					bare: true
				files:
					"dist/js/vapour.js": "src/core/vapour.coffee"

			plugins:
				options:
					bare: true
				files:
					"dist/js/wet-boew.js": ["src/core/helpers.coffee", "src/plugins/**/*.coffee"]

		modernizr:
			devFile: "lib/modernizr/modernizr-custom.js"
			outputFile: "lib/modernizr/modernizr-custom.js"
			extra:
				shiv: true
				printshiv: false
				load: true
				mq: true
				css3: true
				input: true
				inputtypes: true
				html5: true
				cssclasses: true
				fontface: true
				backgroundsize: true
				borderimage: true
			extensibility:
				addtest: false
				prefixed: false
				teststyles: true
				testprops: true
				testallprops: true
				hasevents: true
				prefixes: true
				domprefixes: true
			tests: ["elem_details"]
			parseFiles: false
			matchCommunityTests: false

		copy:
			jquery:
				cwd: "lib/jquery"
				src: [
					"jquery.min.js",
					"jquery.min.map"
				]
				dest: "dist/js"
				expand: true

			oldie:
				cwd: "lib"
				src: [
					"jquery-ie/jquery.min.js",
					"jquery-ie/jquery.min.map",
					"selectivizr/selectivizr.js",
					"respond/respond.min.js"
				]
				dest: "dist/js/oldie"
				expand: true
				flatten: true

			bootstrap:
				files: [
					{
						cwd: "lib/bootstrap"
						src: [
							"dist/css/bootstrap<%= environment.suffix %>.css"
						]
						dest: "dist/css"
						expand: true
						flatten: true
					}
					{
						cwd: "lib/bootstrap/fonts"
						src: ["*.*"]
						dest: "dist/fonts"
						expand: true
						flatten: true
					}
				]

			misc:
				cwd: "src/plugins"
				src: ["**/*.*", "!**/*.js", "!**/*.coffee", "!**/*.scss", "!**/*.hbs", "!**/assets/*"]
				dest: "dist/demo"
				expand: true

			polyfills:
				cwd: "src/polyfills"
				src: "**/*.js"
				dest: "dist/js/polyfills"
				expand: true
				flatten: true

			deps:
				files:
					"dist/js/deps/jquery.pjax.js": "lib/jquery-pjax/jquery.pjax.js"
					"dist/js/deps/matchMedia.js": "lib/matchMedia/matchmedia.js"
					"dist/js/deps/picturefill.js": "lib/picturefill/picturefill.js"
					"dist/js/polyfills/excanvas.js": "lib/excanvas/excanvas.js"

			jsAssets:
				cwd: "src/plugins"
				src: "**/assets/*"
				dest: "dist/js/assets"
				expand: true
				flatten: true

		clean:
			dist: "dist"

			jsUncompressed: ["dist/js/**/*.js", "!dist/js/**/*<%= environment.suffix %>.js"]
			cssUncompressed: ["dist/css/**/*.css", "!dist/css/**/*<%= environment.suffix %>.css"]

		watch:
			lib_test:
				files: "<%= jshint.lib_test.src %>"
				tasks: ["jshint:lib_test", "qunit"]

			source:
				files: "<%= jshint.lib_test.src %>"
				tasks: ["build"]
				options:
					interval: 5007
					livereload: true

		jshint:
			options:
				curly: true
				eqeqeq: true
				immed: true
				latedef: true
				newcap: true
				noarg: true
				sub: true
				undef: true
				unused: true
				boss: true
				eqnull: true
				browser: true
				globals:
					jQuery: true

			lib_test:
				src: ["src/**/*.js", "!src/**/*min.js", "!src/polyfills/**/*.js", "test/**/*.js"]

		connect:
			server:
				options:
					port: 8000
					base: "."

		i18n:
			options:
				template: "src/i18n/base.js"
				csv: "src/i18n/i18n.csv"
			src: "src/js/i18n/formvalid/*.js"

		"gh-pages":
			options:
				repo: "https://" + process.env.GH_TOKEN + "@github.com/wet-boew/wet-boew-dist.git"
				branch: "v4.0-dist"
				clone: "wet-boew-dist"
				message: "Travis build " + process.env.TRAVIS_BUILD_NUMBER
			src: [
				"dist/**/*.*",
				"*.html",
				"*.md",
				"*.txt"
			]


	# These plugins provide necessary tasks.
	@loadNpmTasks "assemble"
	@loadNpmTasks "grunt-autoprefixer"
	@loadNpmTasks "grunt-contrib-clean"
	@loadNpmTasks "grunt-contrib-coffee"
	@loadNpmTasks "grunt-contrib-concat"
	@loadNpmTasks "grunt-contrib-connect"
	@loadNpmTasks "grunt-contrib-copy"
	@loadNpmTasks "grunt-contrib-cssmin"
	@loadNpmTasks "grunt-contrib-jshint"
	@loadNpmTasks "grunt-contrib-uglify"
	@loadNpmTasks "grunt-contrib-watch"
	@loadNpmTasks "grunt-modernizr"
	@loadNpmTasks "grunt-gh-pages"
	@loadNpmTasks "grunt-sass"

	# Load custom grunt tasks form the tasks directory
	@loadTasks "tasks"

	# Default task.
	@registerTask "default", ["dist"]

	@registerTask "js", ["coffee","concat", "i18n"]
	@registerTask "css", ["sass", "autoprefixer"]

	@registerTask "dist-js", ["js", "uglify", "clean:jsUncompressed"]
	@registerTask "dist-css", ["css", "cssmin", "clean:cssUncompressed"]

	@registerTask "dist", ["clean:dist", "copy", "dist-js", "dist-css", "test", "html"]
	@registerTask "debug", ["clean:dist", "copy", "js", "css", "test", "html"]

	@registerTask "test", ["jshint"]
	@registerTask "html", ["assemble"]
	@registerTask "server", ["connect", "watch:source"]
	@registerTask "init", ["modernizr"]
	@registerTask "deploy", ["gh-pages"]

	@
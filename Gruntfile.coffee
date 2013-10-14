module.exports = (grunt) ->

	# External tasks
	@registerTask(
		"default",
		"Default task, that runs the production build",
		[
			"dist"
		]
	)

	@registerTask(
		"dist",
		"Produces the production files",
		[
			"test",
			"clean:dist",
			"assets",
			"dist-js",
			"dist-css",
			"demos"
		]
	)

	@registerTask(
		"debug",
		"Produces unminified files",
		[
			"test",
			"clean:dist",
			"assets",
			"js",
			"css",
			"demos"
		]
	)

	@registerTask(
		"deploy",
		"Build and deploy artifacts to wet-boew-dist",
		[
			"dist",
			"gh-pages"
		]
	)

	@registerTask(
		"saucelabs",
		"Full build for running tests on SauceLabs. Currently only for Travis builds",
		[
			"clean:dist",
			"assets",
			"js",
			"css",
			"copy:tests",
			"assemble:tests"
			"connect",
			"saucelabs-mocha",
		]
	)

	@registerTask(
		"init",
		"Only needed when the repo is first cloned",
		[
			"modernizr"
		]
	)

	#Internal task groups
	@registerTask(
		"js",
		"INTERNAL: Compiles CoffeeScript and copies all third party JS to the dist folder",
		[
			"coffee",
			"copy:jquery",
			"copy:polyfills",
			"copy:deps",
			"copy:jsAssets",
			"uglify:oldie",
			"concat",
			"i18n"
		]
	)

	@registerTask(
		"dist-js",
		"INTERNAL: Compile and minify JS, and then cleans up unminifed JS in dist",
		[
			"js",
			"uglify",
			"clean:jsUncompressed"
		]
	)

	@registerTask(
		"css",
		"INTERNAL: Compiles Sass and copies third party CSS to the dist folder"
		[
			"sass",
			"autoprefixer",
			"copy:bootstrap"
		]
	)

	@registerTask(
		"dist-css",
		"INTERNAL: Compile and minify CSS, and then cleans up unminifed files in dist",
		[
			"css",
			"cssmin",
			"clean:cssUncompressed"
		]
	)

	@registerTask(
		"assets",
		"INTERNAL: Process non-CSS/JS assets to dist",
		[
			"copy:misc"
		]
	)

	@registerTask(
		"test",
		"INTERNAL: Runs testing tasks, except for SauceLabs testing",
		[
			"jshint"
		]
	)

	@registerTask(
		"demos",
		"INTERNAL: Compile the demo files",
		[
			"assemble:site",
			"assemble:plugins"
			"assemble:polyfills"
		]
	)

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
					"src/core/helpers.js"
					"dist/js/wet-boew.js",
					"src/plugins/**/*.js",
					"!src/plugins/**/test.js"
				]
				dest: "dist/js/wet-boew.js"

			core:
				options:
					stripBanners: false
				src: [
					"lib/modernizr/modernizr-custom.js",
					"src/core/vapour.js"
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
				layout: "default.hbs"
				environment:
					suffix: "<%= environment.suffix %>"

			site:
				expand: true
				cwd: "src"
				src: ["*.hbs"]
				dest: "dist/"

			plugins:
				expand: true
				cwd: "src/plugins"
				src: ["**/*.hbs"]
				dest: "dist/demo"

			polyfills:
				expand: true
				cwd: "src/polyfills"
				src: ["**/*.hbs"]
				dest: "dist/demo"

			tests:
				options:
					environment:
						test: true
				expand: true
				cwd: "src/plugins"
				src: ["**/*.hbs"]
				dest: "dist/demo"

		# Compiles the Sass files
		sass:
			all:
				expand: true
				cwd: "src/base"
				src: ["**/*.scss", "!**/_*.scss"]
				dest: "dist/css/"
				ext: ".css"

			theme:
				expand: true
				cwd: "theme/sass"
				src: ["**/*.scss", "!**/_*.scss"]
				dest: "dist/css/"
				ext: ".css"

		autoprefixer:
			options:
				browsers: [
					"last 2 versions",
					"ff >= 17",
					"opera 12.1",
					"bb >= 7",
					"android >= 2.3",
					"ie >= 8",
					"ios 5"
				]

			all:
				cwd: "dist/css"
				src: [
					"**/*.css",
					"!**/*.min.css"
				]
				dest: "dist/css"
				expand: true
				flatten: true

		# Minify
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
				dest: "dist/js/deps/"
				rename: (destBase, destPath) ->
					return destBase + destPath.replace(/\.js$/, "<%= environment.suffix %>.js")

			oldie:
				options:
					preserveComments: "some"
				files:
					"dist/js/oldie/ie8<%= environment.suffix %>.js" : [ "lib/respond/respond.min.js", "lib/html5shiv/dist/html5shiv.js", "lib/jquery-ie/jquery.min.js", "lib/selectivizr/selectivizr.js", "src/polyfills/localstorage/localstorage.js" ]

		cssmin:
			options:
				banner: "@charset \"utf-8\";\n<%= banner %>"
			dist:
				expand: true
				cwd: "dist/css"
				src: ["**/*.css", "!**/*.min.css"]
				dest: 'dist/css'
				ext: "<%= environment.suffix %>.css"

		coffee:

			plugins:
				options:
					bare: true
				files:
					"dist/js/wet-boew.js": ["src/core/helpers.coffee", "src/plugins/**/*.coffee"]

		modernizr:
			devFile: "lib/modernizr/modernizr-custom.js"
			outputFile: "lib/modernizr/modernizr-custom.js"
			extra:
				shiv: false
				printshiv: false
				load: true
				mq: true
				css3: true
				input: true
				inputtypes: true
				html5: true
				cssclasses: true
				csstransitions: true
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
				cwd: "lib/oldie"
				src: [
					"oldie-helper.min.js"
					#"jquery-ie/jquery.min.js",
					#"jquery-ie/jquery.min.map",
					#"selectivizr/selectivizr.js",
					#"respond/respond.min.js"
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
				src: [
					"**/*.*",
					"!**/*.js",
					"!**/*.coffee",
					"!**/*.scss",
					"!**/*.hbs",
					"!**/assets/*"
				]
				dest: "dist/demo"
				expand: true

			tests:
				cwd: "src/plugins"
				src: [
					"**/test.js"
				]
				dest: "dist/demo"
				expand: true

			polyfills:
				files: [
					(
						cwd: "src/polyfills"
						src: "**/*.js"
						dest: "dist/js/polyfills"
						expand: true
						flatten: true
					)
					(
						cwd: "lib"
						src: [
							"excanvas/excanvas.js"
						]
						dest: "dist/js/polyfills"
						expand: true
						flatten: true
					)
				]

			deps:
				cwd: "lib"
				src: [
					"jquery-pjax/jquery.pjax.js"
					"jquery.validation/jquery.validate.js"
					"jquery.validation/additional-methods.js"
					"jquery.validation/localization/*.js"
					"magnific-popup/dist/jquery.magnific-popup.js"
					"google-code-prettify/src/*.js"
					"DataTables/media/js/jquery.dataTables.js"
				]
				dest: "dist/js/deps"
				expand: true
				flatten: true

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
			tests: ["dist/demo/**/test.js"]

		watch:
			lib_test:
				files: "<%= jshint.lib_test.src %>"
				tasks: ["jshint:lib_test", "qunit"]

			source:
				files: "<%= jshint.lib_test.src %>"
				tasks: ["dist"]
				options:
					interval: 5007
					livereload: true

		jshint:
			options:
				jshintrc: ".jshintrc"

			lib_test:
				src: [
					"src/**/*.js",
					"!src/**/*min.js",
					"theme/**/*.js",
					"!src/polyfills/**/*.js",
					"test/**/*.js", "tasks/*.*"
				]

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

		"saucelabs-mocha":
			all:
				options:
					urls: grunt.file.glob.sync("dist/demo/**/*.{html,html}").map((file) ->
						"http://127.0.0.1:8000/" + file
					)
					tunnelTimeout: 5
					build: process.env.TRAVIS_BUILD_NUMBER
					concurrency: 3
					browsers: grunt.file.readJSON "browsers.json"
					testname: "WET-BOEW Travis Build #{process.env.TRAVIS_BUILD_NUMBER}"
					tags: [
						process.env.TRAVIS_BRANCH,
						process.env.TRAVIS_COMMIT
					]

		"gh-pages":
			options:
				repo: "https://" + process.env.GH_TOKEN + "@github.com/wet-boew/wet-boew-dist.git"
				branch: process.env.build_branch
				clone: "wet-boew-dist"
				message: "Travis build " + process.env.TRAVIS_BUILD_NUMBER
				silent: true
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
	@loadNpmTasks "grunt-saucelabs"

	# Load custom grunt tasks form the tasks directory
	@loadTasks "tasks"

	@

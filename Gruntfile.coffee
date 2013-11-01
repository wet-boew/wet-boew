path = require("path")

module.exports = (grunt) ->

	# External tasks
	@registerTask(
		"default"
		"Default task that runs the production build"
		[
			"dist"
		]
	)

	@registerTask(
		"dist"
		"Produces the production files"
		[
			"test"
			"clean:dist"
			"assets"
			"dist-js"
			"dist-css"
			"demos"
		]
	)

	@registerTask(
		"debug"
		"Produces unminified files"
		[
			"test"
			"clean:dist"
			"assets"
			"js"
			"css"
			"demos"
		]
	)

	@registerTask(
		"deploy"
		"Build and deploy artifacts to wet-boew-dist"
		[
			"dist"
			"copy:deploy"
			"gh-pages"
		]
	)

	@registerTask(
		"test-mocha"
		"Full build for running tests locally with Grunt Mocha"
		[
			"pre-mocha"
			"mocha"
		]
	)

	@registerTask(
		"saucelabs"
		"Full build for running tests on SauceLabs. Currently only for Travis builds"
		[
			"pre-mocha"
			"connect"
			"saucelabs-mocha"
		]
	)

	@registerTask(
		"init"
		"Only needed when the repo is first cloned"
		[
			"modernizr"
		]
	)

	#Internal task groups
	@registerTask(
		"js"
		"INTERNAL: Copies all third party JS to the dist folder"
		[
			"copy:jquery"
			"copy:polyfills"
			"copy:deps"
			"copy:jsAssets"
			"i18n"
			"concat:core"
			"concat:coreIE8"
			"concat:plugins"
			"concat:i18n"
		]
	)

	@registerTask(
		"dist-js"
		"INTERNAL: Compile and minify JS, and then cleans up unminifed JS in dist"
		[
			"js"
			"uglify"
			"clean:jsUncompressed"
		]
	)

	@registerTask(
		"css"
		"INTERNAL: Compiles Sass and copies third party CSS to the dist folder"
		[
			"sass"
			"autoprefixer"
			"concat:css"
		]
	)

	@registerTask(
		"dist-css"
		"INTERNAL: Compile and minify CSS, and then cleans up unminifed files in dist"
		[
			"css"
			"cssmin"
			"clean:cssUncompressed"
		]
	)

	@registerTask(
		"assets"
		"INTERNAL: Process non-CSS/JS assets to dist"
		[
			"copy:misc"
			"copy:themeAssets"
			"copy:bootstrap"
		]
	)

	@registerTask(
		"test"
		"INTERNAL: Runs testing tasks except for SauceLabs testing"
		[
			"jshint"
		]
	)

	@registerTask(
		"demos"
		"INTERNAL: Compile the demo files"
		[
			"assemble:site"
			"assemble:plugins"
			"assemble:polyfills"
			"htmlcompressor"
		]
	)

	@registerTask(
		"pre-mocha"
		"INTERNAL: prepare for running Mocha unit tests"
		[
			"clean:dist"
			"assets"
			"js"
			"css"
			"copy:tests"
			"assemble:tests"
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
					"dist/js/wet-boew.js"
					"src/plugins/**/*.js"
					"!src/plugins/**/test.js"
				]
				dest: "dist/js/wet-boew.js"

			core:
				options:
					stripBanners: false
				src: [
					"lib/modernizr/modernizr-custom.js"
					"src/core/vapour.js"
				]
				dest: "dist/js/vapour.js"

			coreIE8:
				options:
					stripBanners: false
				src: [
					"lib/jquery-ie/jquery.min.js"
					"lib/respond/respond.src.js"
					"lib/excanvas/excanvas.js"
					"lib/html5shiv/dist/html5shiv.js"
					"lib/selectivizr/selectivizr.js"
					"src/polyfills/localstorage/localstorage.js"
					"lib/modernizr/modernizr-custom.js"
					"src/core/vapour.js"
				]
				dest: "dist/js/ie8-vapour.js"

			i18n:
				options:
					process: ( src, filepath ) ->
						lang = filepath.replace "dist/js/i18n/", ""
						# jQuery validation uses an underscore for locals
						lang = lang.replace "_", "-"
						validationPath = "lib/jquery.validation/localization/"

						# Check and append message file
						messagesPath = validationPath + "messages_" + lang
						messages = if grunt.file.exists messagesPath then grunt.file.read( messagesPath ) else ""

						# Check and append method file
						methodsPath = validationPath + "methods_" + lang
						methods = if grunt.file.exists methodsPath then grunt.file.read( methodsPath ) else ""

						if methods != "" or messages != ""
							src += "\nvapour.doc.one( \"formLanguages.wb\", function() {\n"
							src += messages
							src += "\n"
							src += methods
							src += "\n});"

						return src

				cwd: "dist/js/i18n"
				src: [
					"*.js"
					"!*.min.js"
				]
				dest: "dist/js/i18n"
				expand: true

			css:
				options:
					banner: ""
				files:
					"dist/css/base.css": [
						"lib/bootstrap/dist/css/bootstrap.css"
						"dist/css/base.css"
					]

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
				dest: "dist/demos"

			polyfills:
				expand: true
				cwd: "src/polyfills"
				src: ["**/*.hbs"]
				dest: "dist/demos"

			tests:
				options:
					environment:
						test: true
				expand: true
				cwd: "src/plugins"
				src: ["**/*.hbs"]
				dest: "dist/demos"

		# Compiles the Sass files
		sass:
			all:
				expand: true
				cwd: "src/base"
				src: [
					"**/*.scss"
					"!**/_*.scss"
				]
				dest: "dist/css/"
				ext: ".css"

			theme:
				expand: true
				cwd: "theme/sass"
				src: [
					"**/*.scss"
					"!**/_*.scss"
				]
				dest: "dist/css/"
				ext: ".css"

			polyfills:
				expand: true
				cwd: "src/polyfills"
				src: [
					"**/*.scss"
					"!**/base.scss"
				]
				dest: "dist/css/polyfills/"
				ext: ".css"
				flatten: true

		autoprefixer:
			options:
				browsers: [
					"last 2 versions"
					"ff >= 17"
					"opera 12.1"
					"bb >= 7"
					"android >= 2.3"
					"ie >= 8"
					"ios 5"
				]

			all:
				cwd: "dist/css"
				src: [
					"**/*.css"
					"!**/polyfills/**/*.css"
					"!**/*.min.css"
				]
				dest: "dist/css"
				expand: true
				flatten: true

			polyfills:
				cwd: "dist/css/polyfills"
				src: [
					"**/*.css"
					"!**/*.min.css"
				]
				dest: "dist/css/polyfills/"
				expand: true

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
				cwd: "dist/js/"
				src: [ "*vapour.js" ]
				dest: "dist/js/"
				ext: "<%= environment.suffix %>.js"
				expand: true

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

		cssmin:
			options:
				banner: "@charset \"utf-8\";\n<%= banner %>"
			dist:
				expand: true
				cwd: "dist/css"
				src: [
					"**/*.css"
					"!**/*.min.css"
				]
				dest: "dist/css"
				ext: "<%= environment.suffix %>.css"

		htmlcompressor:
			options:
				type: "html"
			all:
				cwd: "dist"
				src: [
					"**/*.html"
				]
				dest: "dist"
				expand: true

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
				html5: false
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
					"jquery.min.js"
					"jquery.min.map"
				]
				dest: "dist/js"
				expand: true

			bootstrap:
				cwd: "lib/bootstrap/fonts"
				src: "*.*"
				dest: "dist/fonts"
				expand: true
				flatten: true

			misc:
				cwd: "src/plugins"
				src: [
					"**/*.*"
					"!**/*.js"
					"!**/*.scss"
					"!**/*.hbs"
					"!**/assets/*"
				]
				dest: "dist/demos"
				expand: true

			tests:
				cwd: "src/plugins"
				src: [
					"**/test.js"
				]
				dest: "dist/demos"
				expand: true

			polyfills:
				cwd: "src/polyfills"
				src: "**/*.js"
				dest: "dist/js/polyfills"
				expand: true
				flatten: true

			deps:
				cwd: "lib"
				src: [
					"jquery-pjax/jquery.pjax.js"
					"jquery.validation/jquery.validate.js"
					"jquery.validation/additional-methods.js"
					"magnific-popup/dist/jquery.magnific-popup.js"
					"google-code-prettify/src/*.js"
					"DataTables/media/js/jquery.dataTables.js"
					"xregexp/src/xregexp.js"
				]
				dest: "dist/js/deps"
				expand: true
				flatten: true

			jsAssets:
				cwd: "src"
				src: [
					"plugins/**/assets/*"
					"polyfills/**/assets/*"
				]
				dest: "dist/js/assets"
				expand: true
				flatten: true

			themeAssets:
				cwd: "theme/"
				src: "**/assets/*.*"
				dest: "dist"
				expand: true

			deploy:
				src: [
					"*.txt"
					"README.md"
				]
				dest: "dist"
				expand: true

		clean:
			dist: "dist"

			jsUncompressed: ["dist/js/**/*.js", "!dist/js/**/*<%= environment.suffix %>.js"]
			cssUncompressed: ["dist/css/**/*.css", "!dist/css/**/*<%= environment.suffix %>.css"]
			tests: ["dist/demos/**/test.js"]

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
					"src/**/*.js"
					"theme/**/*.js"
					"test/**/*.js"
					"tasks/*.js"
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

		mocha:
			all:
				grunt.file.expand
					filter: (src) ->
						grunt.file.exists src.substring(0, src.lastIndexOf(path.sep) + 1) + "test.js"
				, "dist/demos/**/*.html"

		"saucelabs-mocha":
			all:
				options:
					urls:
						grunt.file.expandMapping("dist/demos/**/*.html", "http://127.0.0.1:8000/",
							filter: (src) ->
								grunt.file.exists src.substring(0, src.lastIndexOf(path.sep) + 1) + "test.js"
						).map (paths) ->
							paths.dest
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
				base: "dist"
			src: [
				"**/*.*"
			]


	# These plugins provide necessary tasks.
	@loadNpmTasks "assemble"
	@loadNpmTasks "grunt-autoprefixer"
	@loadNpmTasks "grunt-contrib-clean"
	@loadNpmTasks "grunt-contrib-concat"
	@loadNpmTasks "grunt-contrib-connect"
	@loadNpmTasks "grunt-contrib-copy"
	@loadNpmTasks "grunt-contrib-cssmin"
	@loadNpmTasks "grunt-contrib-jshint"
	@loadNpmTasks "grunt-contrib-uglify"
	@loadNpmTasks "grunt-contrib-watch"
	@loadNpmTasks "grunt-gh-pages"
	@loadNpmTasks "grunt-htmlcompressor"
	@loadNpmTasks "grunt-mocha"
	@loadNpmTasks "grunt-modernizr"
	@loadNpmTasks "grunt-sass"
	@loadNpmTasks "grunt-saucelabs"

	# Load custom grunt tasks form the tasks directory
	@loadTasks "tasks"

	@

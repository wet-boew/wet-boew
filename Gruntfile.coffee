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
			"build"
			"assets-dist"
			"assemble:demos"
			"assemble:demos_min"
			"htmlcompressor"
		]
	)

	@registerTask(
		"debug"
		"Produces unminified files"
		[
			"build"
			"assemble:demos"
		]
	)

	@registerTask(
		"build"
		"Run full build."
		[
			"clean:dist"
			"assets"
			"js"
			"css"
		]
	)

	@registerTask(
		"deploy"
		"Build and deploy artifacts to wet-boew-dist"
		[
			"dist"
			"assemble:demos"
			"assemble:demos_min"
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
			"copy:jsDemo"
			"copy:polyfills"
			"copy:other"
			"copy:deps"
			"copy:jsAssets"
			"i18n"
			"concat:core"
			"concat:coreIE8"
			"concat:plugins"
			"concat:i18n"
			"uglify"
		]
	)

	@registerTask(
		"css"
		"INTERNAL: Compiles Sass and copies third party CSS to the dist folder"
		[
			"sass"
			"autoprefixer"
			"concat:css"
			"cssmin"
		]
	)

	@registerTask(
		"assets-dist"
		"INTERNAL: Process non-CSS/JS assets to dist"
		[
			"copy:jquery_min"
			"copy:assets_min"
			"copy:misc_min"
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
		"pre-mocha"
		"INTERNAL: prepare for running Mocha unit tests"
		[
			"build"
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
					"!src/plugins/**/assets/*.js"
					"!src/plugins/**/demo/*.js"
				]
				dest: "dist/unmin/js/wet-boew.js"

			core:
				options:
					stripBanners: false
				src: [
					"lib/modernizr/modernizr-custom.js"
					"src/core/vapour.js"
				]
				dest: "dist/unmin/js/vapour.js"

			coreIE8:
				options:
					stripBanners: false
				src: [
					"lib/jquery-ie/jquery.js"
					"lib/respond/respond.src.js"
					"lib/excanvas/excanvas.js"
					"lib/html5shiv/dist/html5shiv.js"
					"lib/selectivizr/selectivizr.js"
					"src/polyfills/localstorage/localstorage.js"
					"lib/modernizr/modernizr-custom.js"
					"src/core/vapour.js"
				]
				dest: "dist/unmin/js/ie8-vapour.js"

			i18n:
				options:
					process: ( src, filepath ) ->
						lang = filepath.replace "dist/js/unmin/i18n/", ""
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

				cwd: "dist/unmin/js/i18n"
				src: [
					"*.js"
					"!*.min.js"
				]
				dest: "dist/unmin/js/i18n"
				expand: true

			css:
				options:
					banner: ""
				files:
					"dist/unmin/css/base.css": [
						"lib/bootstrap/dist/css/bootstrap.css"
						"dist/unmin/css/base.css"
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
				helpers: "site/helpers/helper-*.js"
				layoutdir: "site/layouts"
				partials: "site/includes/**/*.hbs"
				layout: "default.hbs"

			demos:
				options:
					assets: "dist/unmin"
				files: [
						expand: true
						cwd: "src"
						src: "*.hbs"
						dest: "dist/unmin"
					,
						expand: true
						cwd: "src/plugins"
						src: "**/*.hbs"
						dest: "dist/unmin/demos"
					,
						expand: true
						cwd: "src/polyfills"
						src: "**/*.hbs"
						dest: "dist/unmin/demos"
					,
						expand: true
						cwd: "src/other"
						src: "**/*.hbs"
						dest: "dist/unmin/demos"
					,
						cwd: "site/pages/ajax"
						src: "*.hbs"
						dest: "dist/unmin/ajax"
						expand: true
						flatten: true
				]

			demos_min:
				options:
					environment:
						suffix: ".min"
					assets: "dist"
				files: [
						expand: true
						cwd: "src"
						src: "*.hbs"
						dest: "dist"
					,
						expand: true
						cwd: "src/plugins"
						src: "**/*.hbs"
						dest: "dist/demos"
					,
						expand: true
						cwd: "src/polyfills"
						src: "**/*.hbs"
						dest: "dist/demos"
					,
						expand: true
						cwd: "src/other"
						src: "**/*.hbs"
						dest: "dist/demos"
					,
						cwd: "site/pages/ajax"
						src: "*.hbs"
						dest: "dist/ajax"
						expand: true
						flatten: true
				]

			tests:
				options:
					environment:
						suffix: ".min"
						test: true
				files: "<%= assemble.demos_min.files %>"

		# Compiles the Sass files
		sass:
			all:
				expand: true
				cwd: "src/base"
				src: [
					"**/*.scss"
					"!**/_*.scss"
				]
				dest: "dist/unmin/css/"
				ext: ".css"

			theme:
				expand: true
				cwd: "theme/sass"
				src: [
					"**/*.scss"
					"!**/_*.scss"
				]
				dest: "dist/unmin/css/"
				ext: ".css"

			polyfills:
				expand: true
				cwd: "src/polyfills"
				src: [
					"**/*.scss"
					"!**/*-base.scss"
					"!**/*-ie8.scss"
					"!**/*-noscript.scss"
				]
				dest: "dist/unmin/css/polyfills/"
				ext: ".css"
				flatten: true

			other:
				expand: true
				cwd: "other"
				src: [
					"**/*.scss"
					"!**/base.scss"
				]
				dest: "dist/unmin/css/other/"
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
				cwd: "dist/unmin/css"
				src: [
					"**/*.css"
					"!**/polyfills/**/*.css"
					"!**/other/**/*.css"
					"!**/*.min.css"
				]
				dest: "dist/unmin/css"
				expand: true
				flatten: true

			polyfills:
				cwd: "dist/unmin/css/polyfills"
				src: [
					"**/*.css"
					"!**/*.min.css"
				]
				dest: "dist/unmin/css/polyfills/"
				expand: true

			other:
				cwd: "dist/unmin/css/other"
				src: [
					"**/*.css"
					"!**/*.min.css"
				]
				dest: "dist/unmin/css/other/"
				expand: true

		# Minify
		uglify:
			polyfills:
				options:
					preserveComments: "some"
				expand: true
				cwd: "dist/unmin/js/polyfills/"
				src: ["*.js"]
				dest: "dist/js/polyfills/"
				ext: ".min.js"

			other:
				options:
					preserveComments: "some"
				expand: true
				cwd: "dist/unmin/js/other/"
				src: ["*.js"]
				dest: "dist/js/other/"
				ext: "<%= min_suffix %>.js"

			core:
				options:
					preserveComments: "some"
				cwd: "dist/unmin/js/"
				src: [ "*vapour.js" ]
				dest: "dist/js/"
				ext: ".min.js"
				expand: true

			plugins:
				options:
					banner: "<%= banner %>"
				files:
					"dist/js/wet-boew.min.js": "dist/unmin/js/wet-boew.js"

			jsAssets:
				options:
					preserveComments: "some"
				expand: true
				cwd: "dist/unmin/js/assets/"
				src: ["*.js"]
				dest: "dist/js/assets/"
				ext: ".min.js"

			jsDemo:
				options:
					preserveComments: "some"
				expand: true
				cwd: "dist/unmin/demos/"
				src: ["**/demo/*.js"]
				dest: "dist/demos/"
				ext: ".min.js"

			i18n:
				options:
					banner: "<%= banner %>"
				expand: true
				cwd: "dist/unmin/js/i18n"
				src: ["**/*.js"]
				dest: "dist/js/i18n"
				ext: ".min.js"

			deps:
				options:
					preserveComments: "some"
				expand: true
				cwd: "dist/unmin/js/deps"
				src: ["*.js"]
				dest: "dist/js/deps/"
				rename: (destBase, destPath) ->
					return destBase + destPath.replace(/\.js$/, ".min.js")

		cssmin:
			options:
				banner: "@charset \"utf-8\";\n<%= banner %>"
			dist:
				expand: true
				cwd: "dist/unmin/css"
				src: [
					"**/*.css"
					"!**/*.min.css"
				]
				dest: "dist/css"
				ext: ".min.css"

		htmlcompressor:
			options:
				type: "html"
			all:
				cwd: "dist"
				src: [
					"**/*.html"
					"!unmin/**/*.html"
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
				src: "jquery.js"
				dest: "dist/unmin/js"
				expand: true

			bootstrap:
				cwd: "lib/bootstrap/fonts"
				src: "*.*"
				dest: "dist/unmin/fonts"
				expand: true
				flatten: true

			jsDemo:
				cwd: "src/plugins"
				src: "**/demo/*.js"
				dest: "dist/unmin/demos"
				expand: true		
				
			misc:
				cwd: "src/plugins"
				src: [
					"**/*.*"
					"!**/*.js"
					"!**/*.scss"
					"!**/*.hbs"
					"!**/assets/*"
				]
				dest: "dist/unmin/demos"
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
				dest: "dist/unmin/js/polyfills"
				expand: true
				flatten: true

			other:
				cwd: "src/other"
				src: "**/*.js"
				dest: "dist/unmin/js/other"
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
					"../src/plugins/geomap/deps/openlayers.js"
					"proj4/dist/proj4.js"
				]
				dest: "dist/unmin/js/deps"
				expand: true
				flatten: true

			jsAssets:
				cwd: "src"
				src: [
					"plugins/**/assets/*"
					"polyfills/**/assets/*"
					"other/**/assets/*"
				]
				dest: "dist/unmin/js/assets"
				expand: true
				flatten: true

			themeAssets:
				cwd: "theme/"
				src: "**/assets/*.*"
				dest: "dist/unmin"
				expand: true

			jquery_min:
				cwd: "lib/jquery"
				src: [
					"jquery.min.js"
					"jquery.min.map"
				]
				dest: "dist/js"
				expand: true

			assets_min:
				cwd: "dist/unmin/"
				src: [
					"assets/*"
					"fonts/*"
					"js/assets/*"
					"!**/assets/*.js"
				]
				dest: "dist"
				expand: true

			misc_min:
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

			deploy:
				src: [
					"*.txt"
					"README.md"
				]
				dest: "dist"
				expand: true

		clean:
			dist: "dist"
			tests: ["dist/demos/**/test.js"]

		watch:
			lib_test:
				files: "<%= jshint.lib_test.src %>"
				tasks: "jshint:lib_test"

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
				dest: "dist/unmin/js/i18n/"

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

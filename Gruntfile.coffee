path = require("path")
fs = require("fs")

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
			"demos"
			"demos-dist"
		]
	)

	@registerTask(
		"debug"
		"Produces unminified files"
		[
			"build"
			"demos"
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
			"imagemin"
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

	@registerTask(
		"server"
		"Run the Connect web server for local repo"
		[
			"connect:server:keepalive"
		]
	)

	#Internal task groups
	@registerTask(
		"js"
		"INTERNAL: Copies all third party JS to the dist folder"
		[
			"copy:js"
			"i18n"
			"concat:core"
			"concat:coreIE8"
			"concat:pluginsIE8"
			"concat:i18n"
			"uglify"
		]
	)

	@registerTask(
		"css"
		"INTERNAL: Compiles Sass and copies third party CSS to the dist folder"
		[
			"sprites"
			"sass"
			"autoprefixer"
			"csslint:unmin"
			"concat:css"
			"cssmin:dist"
		]
	)

	@registerTask(
		"assets-dist"
		"INTERNAL: Process non-CSS/JS assets to dist"
		[
			"copy:assets_min"
		]
	)

	@registerTask(
		"demos"
		"INTERNAL: Create unminified demos"
		[
			"copy:demos"
			"csslint:demos"
			"assemble:demos"
		]
	)

	@registerTask(
		"demos-dist"
		"INTERNAL: Create minified demos"
		[
			"copy:demos_min"
			"cssmin:demos_min"
			"assemble:demos_min"
			"htmlcompressor"
		]
	)

	@registerTask(
		"assets"
		"INTERNAL: Process non-CSS/JS assets to dist"
		[
			"copy:themeAssets"
			"copy:bootstrap"
		]
	)

	@registerTask(
		"test"
		"INTERNAL: Runs testing tasks except for SauceLabs testing"
		[
			"jshint"
			"jscs"
		]
	)

	@registerTask(
		"pre-mocha"
		"INTERNAL: prepare for running Mocha unit tests"
		[
			"build"
			"assets-dist"
			"demos"
			"demos-dist"
			"connect:test"
		]
	)

	grunt.util.linefeed = "\n"
	# Project configuration.
	grunt.initConfig

		# Metadata.
		pkg: grunt.file.readJSON("package.json")
		banner: "/*!\n * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)\n * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html\n" +
				" * v<%= pkg.version %> - " + "<%= grunt.template.today(\"yyyy-mm-dd\") %>\n *\n */"
		modernizrBanner: "/*! Modernizr (Custom Build) | MIT & BSD */\n"
		glyphiconsBanner: "/*!\n * GLYPHICONS Halflings for Twitter Bootstrap by GLYPHICONS.com | Licensed under http://www.apache.org/licenses/LICENSE-2.0\n */"

		# Task configuration.
		concat:
			options:
				banner: "<%= banner %><%= modernizrBanner %>"

			core:
				options:
					stripBanners: false
				src: [
					"lib/modernizr/modernizr-custom.js"
					"src/core/wb.js"
					"src/core/helpers.js"
					"src/plugins/**/*.js"
					"!src/plugins/**/test.js"
					"!src/plugins/**/assets/*.js"
					"!src/plugins/**/demo/*.js"
				]
				dest: "dist/unmin/js/wet-boew.js"

			coreIE8:
				options:
					stripBanners: false
				src: [
					"lib/modernizr/modernizr-custom.js"
					"lib/respond/respond.src.js"
					"lib/excanvas/excanvas.js"
					"lib/html5shiv/dist/html5shiv.js"
					"src/core/wb.js"
					"!src/plugins/**/test.js"
					"!src/plugins/**/assets/*.js"
					"!src/plugins/**/demo/*.js"
				]
				dest: "dist/unmin/js/ie8-wet-boew.js"

			pluginsIE8:
				options:
					banner: "<%= banner %>"
					stripBanners: false
				src: [
					"src/core/helpers.js"
					"src/plugins/**/*.js"
					"!src/plugins/**/test.js"
					"!src/plugins/**/assets/*.js"
					"!src/plugins/**/demo/*.js"
				]
				dest: "dist/unmin/js/ie8-wet-boew2.js"

			i18n:
				options:
					process: ( src, filepath ) ->
						lang = filepath.replace "dist/unmin/js/i18n/", ""
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
							src += "\nwb.doc.one( \"formLanguages.wb\", function() {\n"
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
					banner: "@charset \"utf-8\";\n<%= banner %><%= glyphiconsBanner %>"
				files:
					"dist/unmin/css/wet-boew.css": [
						"lib/bootstrap/dist/css/bootstrap.css"
						"dist/unmin/css/wet-boew.css"
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
					environment:
						root: "/v4.0-ci/unmin"
					assets: "dist/unmin"
				files: [
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
						cwd: "site/pages"
						src: "**/*.hbs"
						dest: "dist/unmin"
						expand: true
				]

			demos_min:
				options:
					environment:
						suffix: ".min"
						root: "/v4.0-ci"
					assets: "dist"
				files: [
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
						cwd: "site/pages"
						src: "**/*.hbs"
						dest: "dist"
						expand: true
				]

		#Generate the sprites include stylesheets
		sprites:
			share:
				src: [
					"src/plugins/share/sprites/*.png"
					"!src/plugins/share/sprites/sprites_*.png"
				]
				css: "src/plugins/share/_sprites.scss"
				map: "src/plugins/assets/sprites_share.png"
				output: "scss"

		# Compiles the Sass files
		sass:
			all:
				files: [
					expand: true
					cwd: "src/base"
					src: [
						"**/*.scss"
						"!**/_*.scss"
						"!**/demo/*.scss"
					]
					dest: "dist/unmin/css/"
					ext: ".css"
				,
					expand: true
					cwd: "theme/sass"
					src: [
						"**/*.scss"
						"!**/_*.scss"
					]
					dest: "dist/unmin/css/"
					ext: ".css"
				,
					expand: true
					cwd: "src/polyfills"
					src: [
						"**/*.scss"
						"!**/*-base.scss"
						"!**/*-ie8.scss"
						"!**/*-noscript.scss"
						"!**/demo/*.scss"
					]
					dest: "dist/unmin/css/polyfills/"
					ext: ".css"
					flatten: true
				,
					expand: true
					cwd: "src/other"
					src: [
						"**/*.scss"
						"!**/*base.scss"
						"!**/demo/*.scss"
					]
					dest: "dist/unmin/css/other/"
					ext: ".css"
					flatten: true
				,
					expand: true
					cwd: "src/plugins"
					src: "**/demo/*.scss"
					dest: "dist/unmin/demos/"
					ext: ".css"
				,
					expand: true
					cwd: "src/polyfills"
					src: "**/demo/*.scss"
					dest: "dist/unmin/demos/"
					ext: ".css"
				,
					expand: true
					cwd: "src/other"
					src: "**/demo/*.scss"
					dest: "dist/unmin/demos/"
					ext: ".css"
				]

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
				files: [
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
				,
					cwd: "dist/unmin/css/polyfills"
					src: [
						"**/*.css"
						"!**/*.min.css"
					]
					dest: "dist/unmin/css/polyfills/"
					expand: true
				,
					cwd: "dist/unmin/css/other"
					src: [
						"**/*.css"
						"!**/*.min.css"
					]
					dest: "dist/unmin/css/other/"
					expand: true
				]

		csslint:
			options:
				"adjoining-classes": false
				"box-model": false
				"box-sizing": false
				"compatible-vendor-prefixes": false
				"duplicate-background-images": false
				# Can be turned off after https://github.com/dimsemenov/Magnific-Popup/pull/303 lands
				"empty-rules": false
				"fallback-colors": false
				"font-sizes": false
				"gradients": false
				"headings": false
				"ids": false
				"important": false
				"outline-none": false
				"overqualified-elements": false
				"qualified-headings": false
				"unique-headings": false
				"universal-selector": false
				"unqualified-attributes": false

			unmin:
				options:
					absoluteFilePathsForFormatters: true
					formatters: [
						id: "csslint-xml"
						dest: "csslint-unmin.log"
					]
				src: "dist/unmin/css/*.css"

			demos:
				options:
					absoluteFilePathsForFormatters: true
					formatters: [
						id: "csslint-xml"
						dest: "csslint-demos.log"
					]
				src: "dist/unmin/demos/**/*.css"

		# Minify
		uglify:
			polyfills:
				options:
					preserveComments: (uglify,comment) ->
						return comment.value.match(/^!/i)
				expand: true
				cwd: "dist/unmin/js/polyfills/"
				src: ["*.js"]
				dest: "dist/js/polyfills/"
				ext: ".min.js"

			other:
				options:
					preserveComments: (uglify,comment) ->
						return comment.value.match(/^!/i)
				expand: true
				cwd: "dist/unmin/js/other/"
				src: ["*.js"]
				dest: "dist/js/other/"
				ext: ".min.js"

			demo:
				options:
					banner: "<%= banner %>"
					preserveComments: (uglify,comment) ->
						return comment.value.match(/^!/i)
				expand: true
				cwd: "dist/unmin/demos/"
				src: ["**/demo/*.js"]
				dest: "dist/demos/"
				ext: ".min.js"

			core:
				options:
					preserveComments: (uglify,comment) ->
						return comment.value.match(/^!/i)
				cwd: "dist/unmin/js/"
				src: [ "*wet-boew*.js" ]
				dest: "dist/js/"
				ext: ".min.js"
				expand: true

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
				banner: ""
			dist:
				expand: true
				cwd: "dist/unmin/css"
				src: [
					"**/*.css"
				]
				dest: "dist/css"
				ext: ".min.css"

			demos_min:
				expand: true
				cwd: "dist/unmin/demos/"
				src: [
					"**/demo/*.css"
				]
				dest: "dist/demos/"
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
				svg: true
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
			tests: [
				"elem_details"
				"elem_progress_meter"
				"mathml"
			]
			parseFiles: false
			matchCommunityTests: false

		copy:
			bootstrap:
				cwd: "lib/bootstrap/fonts"
				src: "*.*"
				dest: "dist/unmin/fonts"
				expand: true
				flatten: true

			js:
				files: [
					cwd: "src/polyfills"
					src: "**/*.js"
					dest: "dist/unmin/js/polyfills"
					expand: true
					flatten: true
				,
					cwd: "src/other"
					src: "**/*.js"
					dest: "dist/unmin/js/other"
					expand: true
					flatten: true
				,
					cwd: "lib"
					src: [
						"jquery-pjax/jquery.pjax.js"
						"jquery.validation/jquery.validate.js"
						"jquery.validation/additional-methods.js"
						"magnific-popup/dist/jquery.magnific-popup.js"
						"google-code-prettify/src/*.js"
						"DataTables/media/js/jquery.dataTables.js"
					]
					dest: "dist/unmin/js/deps"
					expand: true
					flatten: true
				,
					cwd: "src"
					src: [
						"plugins/**/assets/*"
						"polyfills/**/assets/*"
						"other/**/assets/*"
					]
					dest: "dist/unmin/assets"
					expand: true
					flatten: true
				]

			demos:
				files: [
					cwd: "src/plugins"
					src: [
						"**/*.{jpg,html,xml}"
						"**/demo/*.*"
						"**/ajax/*.*"
						"**/img/*.*"
						"!**/assets/*.*"
						"!**/*.scss"
					]
					dest: "dist/unmin/demos/"
					expand: true
				,
					cwd: "src/polyfills"
					src: "**/demo/*.js"
					dest: "dist/unmin/demos/"
					expand: true
				,
					cwd: "src/other"
					src: "**/demo/*.js"
					dest: "dist/unmin/demos/"
					expand: true
				]

			themeAssets:
				cwd: "theme/"
				src: "assets/*.*"
				dest: "dist/unmin"
				expand: true

			assets_min:
				cwd: "dist/unmin/"
				src: [
					"assets/*"
					"fonts/*"
					"js/assets/*"
				]
				dest: "dist"
				expand: true

			demos_min:
				cwd: "dist/unmin/demos"
				src: [
					"**/*.{jpg,html,xml}"
					"**/demo/*.*"
					"**/ajax/*.*"
					"**/img/*.*"
					# CSS is copied by the cssmin:demos_min task
					"!**/*.css"
				]
				dest: "dist/demos/"
				expand: true

			deploy:
				src: [
					"*.txt"
					"README.md"
				]
				dest: "dist"
				expand: true

		imagemin:
			all:
				cwd: "dist/unmin"
				src: "**/*.png"
				dest: "dist/unmin"
				expand: true

		clean:
			dist: ["dist", "src/base/partials/*sprites*"]

		watch:
			lib_test:
				files: "<%= jshint.lib_test.src %>"
				tasks: "jshint:lib_test"

			source:
				files: [
					"src/**/*.*"
					"!src/**/*sprites*"
				]
				tasks: "dist"
				options:
					interval: 5007
					livereload: true

			demos:
				files: [
					"**/*.hbs"
				]
				tasks: [
					"assemble"
				]
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
		jscs:
			all:
				src: [
					"src/**/*.js"
					"theme/**/*.js"
					"test/**/*.js"
					"tasks/*.js"
				]


		connect:
			options:
				port: 8000

			server:
				options:
					base: "dist"
					middleware: (connect, options) ->
						middlewares = []
						middlewares.push(connect.compress(
							filter: (req, res) ->
								/json|text|javascript|dart|image\/svg\+xml|application\/x-font-ttf|application\/vnd\.ms-opentype|application\/vnd\.ms-fontobject/.test(res.getHeader('Content-Type'))
						))
						middlewares.push(connect.static(options.base));
						middlewares

			test:
				options:
					base: "."
					middleware: (connect, options) ->
						middlewares = []

						mochascript = (req, res, next) ->
							url = req._parsedUrl.pathname

							# Skip to the static middleware if it's an index file or not HTML
							if /index|mobmenu[-]?\w*\.html/.test( url ) or not /\.html/.test( url )
								return next()

							dir = url.substring( 0, url.lastIndexOf( "/" ) + 1 )

							# Test to see if the plugin or polyfill has a test file
							plugins = dir.replace("/dist/demos/", "src/plugins/") + "test.js"

							polyfills = dir.replace("/dist/demos/", "src/polyfills/") + "test.js"

							testFile = if fs.existsSync( plugins ) then plugins else if fs.existsSync( polyfills ) then polyfills else ""

							if testFile != ""

								result = fs.readFileSync( __dirname + url, { encoding: "utf-8" } )

								# Append mocha content to the response above the footer
								result = result.replace( "</main>", "<div class='row' id='mocha'></div></main>" )

								mochaPath = path.dirname( require.resolve( "mocha" ) )

								testHtml = "<link src='/" + path.relative(__dirname, mochaPath) + "/mocha.css' />"
								testHtml += "<script src='/" + path.relative(__dirname, mochaPath) + "/mocha.js'></script>"

								# Append ExpectJS script
								testHtml += "<script src='/" + path.relative(__dirname, require.resolve( "expect.js" ) ) + "'></script>"

								# Append Sinon scripts
								testHtml += "<script src='/" + path.dirname( path.relative(__dirname, require.resolve( "sinon" ) ) ) + "/../pkg/sinon.js'></script>"
								testHtml += "<!--[if lt IE 9]><script src='/" + path.dirname( path.relative(__dirname, require.resolve( "sinon" ) ) ) + "/../pkg/sinon-ie.js'></script><![endif]-->"

								testHtml += "<script>mocha.setup( 'bdd' ); wb.doc.on( 'ready', function() { mocha.run(); } );</script>"

								testHtml += "<script src='/" + testFile + "'></script>"

								testHtml += "</body>"

								result = result.replace( "</body>", testHtml )

								res.end( result )
							else
								# No test files found, skipping
								return next()

						middlewares.push mochascript

						# Serve static files.
						middlewares.push connect.static( options.base )

						middlewares

		i18n:
			options:
				template: "src/i18n/base.js"
				csv: "src/i18n/i18n.csv"
				dest: "dist/unmin/js/i18n/"

		mocha:
			all:
				options:
					reporter: "Spec"
					urls: grunt.file.expand(
						filter: ( src ) ->
							src = path.dirname( src ).replace( /\\/g , "/" ) #" This is to escape a Sublime text regex issue in the replace
							return fs.existsSync( src + "/test.js" )
						"src/plugins/**/*.hbs"
						"src/polyfills/**/*.hbs"
					).map( ( src ) ->
						src = src.replace( /\\/g , "/" ) #" This is to escape a Sublime text regex issue in the replace
						src = src.replace( "src/", "dist/")
						src = src.replace( "plugins/", "demos/" )
						src = src.replace( "polyfills/", "demos/" )
						src = src.replace( ".hbs", ".html" )
						return "http://localhost:8000/" + src
					)

		"saucelabs-mocha":
			all:
				options:
					urls: grunt.file.expand(
						filter: ( src ) ->
							src = path.dirname( src ).replace( /\\/g , "/" ) #" This is to escape a Sublime text regex issue in the replace
							return fs.existsSync( src + "/test.js" )
						"src/plugins/**/*.hbs"
						"src/polyfills/**/*.hbs"
					).map( ( src ) ->
						src = src.replace( /\\/g , "/" ) #" This is to escape a Sublime text regex issue in the replace
						src = src.replace( "src/", "dist/")
						src = src.replace( "plugins/", "demos/" )
						src = src.replace( "polyfills/", "demos/" )
						src = src.replace( ".hbs", ".html" )
						return "http://localhost:8000/" + src
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
	@loadNpmTasks "grunt-contrib-csslint"
	@loadNpmTasks "grunt-contrib-cssmin"
	@loadNpmTasks "grunt-contrib-imagemin"
	@loadNpmTasks "grunt-contrib-jshint"
	@loadNpmTasks "grunt-contrib-uglify"
	@loadNpmTasks "grunt-contrib-watch"
	@loadNpmTasks "grunt-gh-pages"
	@loadNpmTasks "grunt-htmlcompressor"
	@loadNpmTasks "grunt-imagine"
	@loadNpmTasks "grunt-jscs-checker"
	@loadNpmTasks "grunt-mocha"
	@loadNpmTasks "grunt-modernizr"
	@loadNpmTasks "grunt-sass"
	@loadNpmTasks "grunt-saucelabs"

	# Load custom grunt tasks form the tasks directory
	@loadTasks "tasks"

	@

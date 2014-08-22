path = require("path")
fs = require("fs")

module.exports = (grunt) ->

	# External tasks
	@registerTask(
		"default"
		"Default task that runs the core unminified build"
		[
			"build"
			"demos"
		]
	)

	@registerTask(
		"travis"
		"Default task that runs the core unminified build"
		[
			"dist"
			"test-mocha"
			"htmllint"
		]
	)

	@registerTask(
		"dist"
		"Produces the production files"
		[
			"checkDependencies"
			"test"
			"build"
			"minify"
			"pages:theme"
			"pages:docs"
			"demos-min"
		]
	)

	@registerTask(
		"build"
		"Run full build."
		[
			"clean:dist"
			"assets"
			"css"
			"js"
			"imagemin"
		]
	)

	@registerTask(
		"minify"
		"Minify built files."
		[
			"js-min"
			"css-min"
			"assets-min"
		]
	)

	@registerTask(
		"deploy"
		"Build and deploy artifacts to wet-boew-dist"
		[
			"copy:deploy"
			"gh-pages:travis"
		]
	)

	@registerTask(
		"test-mocha"
		"Run tests locally with Grunt Mocha"
		[
			"pre-mocha"
			"mocha"
		]
	)

	@registerTask(
		"saucelabs"
		"Run tests on SauceLabs. Currently only for Travis builds"
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

	@registerTask(
		"update-i18n"
		" Update the i18n CSV file used to generate the i18n files"
		[
			"wget:i18n"
		]
	)

	#Internal task groups
	@registerTask(
		"js"
		"INTERNAL: Copies all third party JS to the dist folder"
		[
			"i18n_csv:js"
			"copy:js"
			"concat:core"
			"concat:coreIE8"
			"concat:pluginsIE8"
			"concat:i18n"
		]
	)

	@registerTask(
		"js-min"
		"INTERNAL: Minify the built Javascript files"
		[
			"uglify:polyfills"
			"uglify:core"
			"uglify:coreIE8"
			"uglify:i18n"
			"uglify:deps"
		]
	)

	@registerTask(
		"css"
		"INTERNAL: Compiles Sass and copies third party CSS to the dist folder"
		[
			"sprites"
			"sass:all"
			"autoprefixer"
			"csslint:unmin"
			"concat:css_addBanners"
		]
	)

	@registerTask(
		"css-min"
		"INTERNAL: Minify the CSS files"
		[
			"cssmin:dist"
			"cssmin:distIE8"
			"ie8csscleaning"
		]
	)

	@registerTask(
		"assets-min"
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
			"pages:demos"
			"pages:ajax"
		]
	)

	@registerTask(
		"docs"
		"INTERNAL: Create unminified docs"
		[
			"pages:docs"
		]
	)

	@registerTask(
		"theme"
		"INTERNAL: Create unminified theme"
		[
			"pages:theme"
		]
	)

	@registerTask(
		"demos-min"
		"INTERNAL: Create minified demos"
		[
			"demos"
			"copy:demos_min"
			"cssmin:demos_min"
			"uglify:demos"
			"pages:min"
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
			"copy:test"
			"pages:test"
			"connect:test"
		]
	)

	@registerTask(
		"pages"
		"Task to intelligently call Assemble targets"
		( target ) ->
			if target == "min"
				# Run the minifier and update asset paths
				grunt.task.run(
					"htmlcompressor"
					"useMinAssets"
				);
			else

				if target != "test" and grunt.config("i18n_csv.assemble.locales") == undefined
					grunt.task.run(
						"i18n_csv:assemble"
					)

				# Only use a target path for assemble if pages received one too
				target = if target then ":" + target else ""
				grunt.task.run(
					"assemble" + target
				);
	)

	@registerTask(
		"useMinAssets"
		"Replace unmin refrences with the min paths for HTML files"
		() ->
			htmlFiles = grunt.file.expand(
				"dist/**/*.html"
				"!dist/unmin/**/*.html"
			);

			htmlFiles.forEach(
				( file ) ->
					contents = grunt.file.read( file )
					contents = contents.replace( /\/unmin/g, "" )
					contents = contents.replace( /\"(?!https:)([^\"]*)?\.(js|css)\"/g, "\"$1.min.$2\"" )

					grunt.file.write(file, contents);
			);
	)

	grunt.util.linefeed = "\n"
	# Project configuration.
	grunt.initConfig

		# Metadata.
		pkg: grunt.file.readJSON("package.json")
		jqueryVersion: grunt.file.readJSON("lib/jquery/bower.json")
		jqueryOldIEVersion: grunt.file.readJSON("lib/jquery-oldIE/bower.json")
		banner: "/*!\n * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)\n * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html\n" +
				" * v<%= pkg.version %> - " + "<%= grunt.template.today('yyyy-mm-dd') %>\n *\n */"
		modernizrBanner: "/*! Modernizr (Custom Build) | MIT & BSD */\n"
		glyphiconsBanner: "/*!\n * GLYPHICONS Halflings for Twitter Bootstrap by GLYPHICONS.com | Licensed under http://www.apache.org/licenses/LICENSE-2.0\n */"
		i18nGDocsID: "0AqLc8VEIumBwdDNud1M2Wi1tb0RUSXJxSGp4eXI0ZXc"
		i18nGDocsSheet: 1
		mochaUrls: grunt.file.expand({cwd: "src"}
						"test.js"
						"**/test.js"
					).map( ( src ) ->
						src = src.replace( /\\/g , "/" ) #" This is to escape a Sublime text regex issue in the replace
						src = src.replace( "polyfills/" , "" )
						src = src.replace( "plugins/" , "" )
						src = src.replace( "other/" , "" )
						src = src.replace( ".js" , "" )
						src
					).sort( ( a, b) ->
						if a is "test"
								-1
							else if a > b
								1
							else
								-1
					)

		# Task configuration.
		wget:
			i18n:
				options:
					overwrite: true
				src: "https://docs.google.com/spreadsheet/pub?key=<%= i18nGDocsID %>&gid=<%= i18nGDocsSheet %>&output=csv"
				dest: "src/i18n/i18n.csv"

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
					"!src/plugins/**/deps/*.*"
				]
				dest: "dist/unmin/js/wet-boew.js"

			coreIE8:
				options:
					stripBanners: false
				src: [
					"lib/modernizr/modernizr-custom.js"
					"lib/respond/src/respond.js"
					"lib/excanvas/excanvas.js"
					"lib/html5shiv/dist/html5shiv-printshiv.js"
					"lib/es5-shim/es5-shim.js"
					"src/core/wb.js"
					"!src/plugins/**/test.js"
					"!src/plugins/**/assets/*.js"
					"!src/plugins/**/demo/*.js"
					"!src/plugins/**/deps/*.*"
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
					"!src/plugins/**/deps/*.*"
				]
				dest: "dist/unmin/js/ie8-wet-boew2.js"

			i18n:
				options:
					process: ( src, filepath ) ->
						lang = filepath.replace "dist/unmin/js/i18n/", ""
						# jQuery validation uses an underscore for locals
						lang = lang.replace "_", "-"
						validationPath = "lib/jquery-validation/localization/"

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

			css_addBanners:
				options:
					banner: "@charset \"utf-8\";\n<%= banner %>"
				files:
					"dist/unmin/css/polyfills/datalist.css": "dist/unmin/css/polyfills/datalist.css"
					"dist/unmin/css/polyfills/datepicker.css": "dist/unmin/css/polyfills/datepicker.css"
					"dist/unmin/css/polyfills/details.css": "dist/unmin/css/polyfills/details.css"
					"dist/unmin/css/polyfills/meter.css": "dist/unmin/css/polyfills/meter.css"
					"dist/unmin/css/polyfills/progress.css": "dist/unmin/css/polyfills/progress.css"
					"dist/unmin/css/polyfills/slider.css": "dist/unmin/css/polyfills/slider.css"
					"dist/unmin/css/noscript.css": "dist/unmin/css/noscript.css"
					"dist/unmin/css/theme.css": "dist/unmin/css/theme.css"
					"dist/unmin/css/wet-boew.css": "dist/unmin/css/wet-boew.css"
					"dist/unmin/css/ie8-wet-boew.css": "dist/unmin/css/ie8-wet-boew.css"

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
				environment:
					root: "/v4.0-ci/unmin"
					jqueryVersion: "<%= jqueryVersion.version %>"
					jqueryOldIEVersion: "<%= jqueryOldIEVersion.version %>"
				assets: "dist/unmin"

			theme:
				options:
					flatten: true
					plugins: [
						"assemble-contrib-i18n"
					]
					i18n:
						languages: "<%= i18n_csv.assemble.locales %>"
						templates: [
							"theme/site/pages/**/*.hbs"
							# Don't run i18n transforms on language specific templates
							"!theme/**/*-en.hbs"
							"!theme/**/*-fr.hbs"
						]
				dest: "dist/unmin/theme/"
				src: [
					"theme/**/*-en.hbs"
					"theme/**/*-fr.hbs"
				]

			ajax:
				options:
					flatten: true
					plugins: [
						"assemble-contrib-i18n"
					]
					i18n:
						languages: "<%= i18n_csv.assemble.locales %>"
						templates: [
							"site/pages/ajax/*.hbs"
						]
				dest: "dist/unmin/ajax/"
				src: "!*.*"

			demos:
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
						src: [
							"**/*.hbs",
							"!ajax/**/*.hbs"
							"!docs/**/*.hbs"
						]
						dest: "dist/unmin"
						expand: true
				]

			test:
				options:
					environment:
						root: "/v4.0-ci/unmin"
						jqueryVersion: "<%= jqueryVersion.version %>"
						jqueryOldIEVersion: "<%= jqueryOldIEVersion.version %>"
					assets: "dist/unmin"
				expand: true
				cwd: "site/pages"
				src: "test/test.hbs"
				dest: "dist/unmin"

			docs:
				cwd: "site/pages"
				src: [
					"docs/**/*.hbs"
				]
				dest: "dist/unmin"
				expand: true

		#Generate the sprites including the stylesheet
		sprites:
			share:
				src: [
					"src/plugins/share/sprites/*.png"
				]
				css: "src/plugins/share/sprites/_sprites.scss"
				map: "src/plugins/share/assets/sprites_share.png"
				output: "scss"

		# Compiles the Sass files
		sass:
			all:
				files: [
					expand: true
					cwd: "src/base"
					src: [
						"**/*.scss"
						"!**/demo/*.scss"
					]
					dest: "dist/unmin/css/"
					ext: ".css"
				,
					expand: true
					cwd: "theme"
					src: [
						"**/*.scss"
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
			# Only vendor prefixing and no IE8
			modern:
				options:
					browsers: [
						"last 2 versions"
						"android >= 2.3"
						"bb >= 7"
						"ff >= 17"
						"ie > 8"
						"ios 5"
						"opera 12.1"
					]
				cwd: "dist/unmin/css"
				src: [
					"*.css"
					"!ie8*.css"
				]
				dest: "dist/unmin/css"
				expand: true

			# Needs both IE8 and vendor prefixing
			mixed:
				options:
					browsers: [
						"last 2 versions"
						"android >= 2.3"
						"bb >= 7"
						"ff >= 17"
						"ie >= 8"
						"ios 5"
						"opera 12.1"
					]
				files: [
					cwd: "dist/unmin/css"
					src: [
						"**/*.css"
						"!**/polyfills/**/*.css"
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
					cwd: "dist/unmin/demos"
					src: "**/*.css"
					dest: "dist/unmin/demos/"
					expand: true
				]

			# Only IE8 support
			oldIE:
				options:
					browsers: [
						"ie 8"
					]
				cwd: "dist/unmin/css"
				src: [
					"ie8*.css"
				]
				dest: "dist/unmin/css"
				expand: true
				flatten: true

		csslint:
			options:
				"adjoining-classes": false
				"box-model": false
				"box-sizing": false
				"compatible-vendor-prefixes": false
				"duplicate-background-images": false
				"duplicate-properties": false
				# Can be turned off after https://github.com/dimsemenov/Magnific-Popup/pull/303 lands
				"empty-rules": false
				"fallback-colors": false
				"floats": false
				"font-sizes": false
				"gradients": false
				"headings": false
				"ids": false
				"important": false
				# Need due to use of "\9" hacks for oldIE
				"known-properties": false
				"outline-none": false
				"overqualified-elements": false
				"qualified-headings": false
				"regex-selectors": false
				"selector-max-approaching": false
				# Some Bootstrap mixins end up listing all the longhand properties
				"shorthand": false
				"text-indent": false
				"unique-headings": false
				"universal-selector": false
				"unqualified-attributes": false
				# Zeros are output by some of the Bootstrap mixins, but shouldn't be used in our code
				"zero-units": false

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
					banner: "<%= banner %>"
					preserveComments: (uglify,comment) ->
						return comment.value.match(/^!/i)
				expand: true
				cwd: "dist/unmin/js/polyfills/"
				src: ["*.js"]
				dest: "dist/js/polyfills/"
				ext: ".min.js"

			demos:
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
					beautify:
						quote_keys: true
					preserveComments: (uglify,comment) ->
						return comment.value.match(/^!/i)
				cwd: "dist/unmin/js/"
				src: [
					"*wet-boew*.js"
					"!ie*.js"
				]
				dest: "dist/js/"
				ext: ".min.js"
				expand: true

			coreIE8:
				options:
					beautify:
						quote_keys: true
						ascii_only: true
					preserveComments: (uglify,comment) ->
						return comment.value.match(/^!/i)
				cwd: "dist/unmin/js/"
				src: [ "ie8*.js" ]
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
				options:
					banner: ""
				expand: true
				cwd: "dist/unmin/css"
				src: [
					"**/*.css"
					"!**/ie8*.css"
				]
				dest: "dist/css"
				ext: ".min.css"

			distIE8:
				options:
					banner: ""
					compatibility: "ie8"
					noAdvanced: true
				expand: true
				cwd: "dist/unmin/css"
				src: [
					"**/ie8*.css"
				]
				dest: "dist/css"
				ext: ".min.css"

			demos_min:
				options:
					banner: "@charset \"utf-8\";\n<%= banner %>"
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
				concurrentProcess: 5
				preserveLineBreaks: true
			all:
				cwd: "dist/unmin"
				src: [
					"**/*.html"
				]
				dest: "dist"
				expand: true

		htmllint:
			ajax:
				options:
					ignore: [
						"XHTML element “head” is missing a required instance of child element “title”."
						"The “details” element is not supported properly by browsers yet. It would probably be better to wait for implementations."
						"The value of attribute “title” on element “a” from namespace “http://www.w3.org/1999/xhtml” is not in Unicode Normalization Form C." #required for vietnamese translations
						"Text run is not in Unicode Normalization Form C." #required for vietnamese translations
					]
				src: [
					"dist/unmin/ajax/**/*.html"
					"dist/unmin/demos/menu/demo/*.html"

				]
			ajaxFragments:
				options:
					ignore: [
						"XHTML element “head” is missing a required instance of child element “title”."
						"XHTML element “li” not allowed as child of XHTML element “body” in this context. (Suppressing further errors from this subtree.)"
						"The “aria-controls” attribute must point to an element in the same document."
						"The “details” element is not supported properly by browsers yet. It would probably be better to wait for implementations."
						"The value of attribute “title” on element “a” from namespace “http://www.w3.org/1999/xhtml” is not in Unicode Normalization Form C." #required for vietnamese translations
						"Text run is not in Unicode Normalization Form C." #required for vietnamese translations
						"Start tag seen without seeing a doctype first. Expected “<!DOCTYPE html>”."
					]
				src: [
					"dist/unmin/demos/**/ajax/**/*.html"
					"dist/unmin/assets/*.html"
				]
			all:
				options:
					ignore: [
						"The “details” element is not supported properly by browsers yet. It would probably be better to wait for implementations."
						"The “date” input type is not supported in all browsers. Please be sure to test, and consider using a polyfill."
						"The “track” element is not supported by browsers yet. It would probably be better to wait for implementations."
						"The “time” input type is not supported in all browsers. Please be sure to test, and consider using a polyfill."
						"The value of attribute “title” on element “a” from namespace “http://www.w3.org/1999/xhtml” is not in Unicode Normalization Form C." #required for vietnamese translations
						"Text run is not in Unicode Normalization Form C." #required for vietnamese translations
						"The “longdesc” attribute on the “img” element is obsolete. Use a regular “a” element to link to the description."
					]
				src: [
					"dist/unmin/**/*.html"
					"!dist/unmin/**/ajax/**/*.html"
					"!dist/unmin/assets/**/*.html"
					"!dist/unmin/demos/menu/demo/*.html"
					"!dist/unmin/test/**/*.html"
				]

		ie8csscleaning:
			min:
				expand: true
				cwd: "dist/css"
				src: [
					"**/ie8*.min.css"
				]
				dest: "dist/css"

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
				cwd: "lib/bootstrap-sass-official/assets/fonts/bootstrap"
				src: "*.*"
				dest: "dist/unmin/fonts"
				expand: true
				flatten: true

			test:
				files: [
					cwd: "src/plugins"
					src: [
						"**/test.js"
						"**/test/*.*"
					]
					dest: "dist/unmin/test"
					expand: true
				,
					cwd: "src/polyfills"
					src: [
						"**/test.js"
						"**/test/*.*"
					]
					dest: "dist/unmin/test"
					expand: true
				,
					cwd: "src/other"
					src: [
						"**/test.js"
						"**/test/*.*"
					]
					dest: "dist/unmin/test"
					expand: true
				,
					cwd: "src/"
					src: [
						"**/test.js"
						"**/test/*.*"
					]
					dest: "dist/unmin/test"
					expand: true
				,
					cwd: "node_modules"
					src: [
						"mocha/mocha.js"
						"mocha/mocha.css"
						"expect.js/index.js"
						"sinon/pkg/sinon.js"
						"sinon/pkg/sinon-ie.js"
					]
					dest: "dist/unmin/test"
					expand: true
					flatten: true
				]

			js:
				files: [
					cwd: "src/polyfills"
					src: "**/*.js"
					dest: "dist/unmin/js/polyfills"
					expand: true
					flatten: true
				,
					cwd: "lib"
					src: [
						"jquery-pjax/jquery.pjax.js"
						"flot/jquery.flot.js"
						"flot/jquery.flot.pie.js"
						"flot/jquery.flot.canvas.js"
						"SideBySideImproved/jquery.flot.orderBars.js"
						"jquery-validation/jquery.validate.js"
						"jquery-validation/additional-methods.js"
						"magnific-popup/dist/jquery.magnific-popup.js"
						"google-code-prettify/src/*.js"
						"DataTables/media/js/jquery.dataTables.js"
						"proj4/dist/proj4.js"
						"openlayers/OpenLayers.debug.js"
					]
					dest: "dist/unmin/js/deps"
					rename: (dest, src) ->
						return dest + "/" + src.replace( ".debug", "" )
					expand: true
					flatten: true
				,
					cwd: "src"
					src: [
						"plugins/**/assets/*"
						"polyfills/**/assets/*"
					]
					dest: "dist/unmin/assets"
					expand: true
					flatten: true
				,
					cwd: "src/plugins"
					src: [
						"**/deps/*.js"
					]
					dest: "dist/unmin/js/deps"
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
						"!**/deps/*.*"
						"!**/test/*.*"
						"!**/*.scss"
					]
					dest: "dist/unmin/demos/"
					expand: true
				,
					cwd: "src/polyfills"
					src: [
						"**/demo/*.*"
						"!**/*.scss"
					]
					dest: "dist/unmin/demos/"
					expand: true
				,
					cwd: "src/other"
					src: [
						"**/demo/*.*"
						"!**/*.scss"
					]
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
					# CSS is copied by the uglify:demos task
					"!**/*.js"
				]
				dest: "dist/demos/"
				expand: true

			deploy:
				src: [
					"*.txt"
					"*.html"
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
					"<%= assemble.demos.src %>"
				]
				tasks: [
					"pages:demos"
				]
				options:
					interval: 5007
					livereload: true

			docs:
				files: [
					"<%= assemble.docs.src %>"
				]
				tasks: [
					"pages:docs"
				]
				options:
					livereload: true

		jshint:
			options:
				jshintrc: ".jshintrc"

			lib_test:
				src: [
					"src/**/*.js"
					"theme/**/*.js"
					"tasks/*.js"
				]

		jscs:
			all:
				options:
					config: ".jscsrc"

				src: [
					"<%= jshint.lib_test.src %>"
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

						middlewares.push (req, res, next) ->
							req.url = req.url.replace( "/v4.0-ci/", "/" )
							next()

						middlewares.push(connect.static(options.base));

						# Serve the custom error page
						middlewares.push (req, res) ->
							filename = options.base + req.url

							if not grunt.file.exists( filename )
								filename = options.base + "/404.html"

								# Set the status code manually
								res.statusCode = 404

							res.end( grunt.file.read( filename ) )

						middlewares

			test:
				options:
					base: "."
					middleware: (connect, options) ->
						middlewares = []

						# Serve static files.
						middlewares.push connect.static( options.base )

						middlewares

		i18n_csv:
			options:
				csv: "src/i18n/i18n.csv"
				startCol: 1
				useDefaultOnMissing: true
				headerRowHasKey: true
			js:
				options:
					template: "src/i18n/base.js"
				dest: "dist/unmin/js/i18n/"
			assemble:
				dest: 'site/data/i18n'

		mocha:
			all:
				options:
					reporter: "Spec"
					urls: ["http://localhost:8000/dist/unmin/test/test.html"]

		"saucelabs-mocha":
			all:
				options:
					urls: ["http://localhost:8000/dist/unmin/test/test.html"]
					throttled: 3
					browsers: grunt.file.readJSON "browsers.json"
					testname: process.env.TRAVIS_COMMIT_MSG
					build: process.env.TRAVIS_BUILD_NUMBER
					tags: [
						process.env.TRAVIS_JOB_ID
						process.env.TRAVIS_BRANCH
						process.env.TRAVIS_COMMIT
					]
					sauceConfig:
						"video-upload-on-pass": false
						"single-window": true
						"record-screenshots": false
						"capture-html": true

		"gh-pages":
			options:
				clone: "wet-boew-dist"
				base: "dist"

			travis:
				options:
					repo: "https://" + process.env.GH_TOKEN + "@github.com/wet-boew/wet-boew-dist.git"
					branch: process.env.build_branch
					message: "Travis build " + process.env.TRAVIS_BUILD_NUMBER
					silent: true
				src: [
					"**/*.*"
				]

			local:
				src: [
					"**/*.*"
				]

		checkDependencies:
			all:
				options:
					npmInstall: false

	# These plugins provide necessary tasks.
	@loadNpmTasks "assemble"
	@loadNpmTasks "grunt-autoprefixer"
	@loadNpmTasks "grunt-check-dependencies"
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
	@loadNpmTasks "grunt-html"
	@loadNpmTasks "grunt-htmlcompressor"
	@loadNpmTasks "grunt-i18n-csv"
	@loadNpmTasks "grunt-imagine"
	@loadNpmTasks "grunt-jscs"
	@loadNpmTasks "grunt-mocha"
	@loadNpmTasks "grunt-modernizr"
	@loadNpmTasks "grunt-sass"
	@loadNpmTasks "grunt-saucelabs"
	@loadNpmTasks "grunt-wget"

	# Load custom grunt tasks form the tasks directory
	@loadTasks "tasks"

	require( "time-grunt" )( grunt )
	@

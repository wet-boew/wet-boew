path = require("path")
fs = require("fs")
sass = require("sass")

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
		"dist"
		"Produces the production files"
		[
			"test"
			"build"
			"minify"
			"pages:theme"
			"docs-min"
			"demos-min"
			"htmllint"
			"bootlint"
			"sri"
		]
	)

	@registerTask(
		"build"
		"Run full build."
		[
			"checkDependencies"
			"clean:dist"
			"assets"
			"sprite"
			"css"
			"js"
		]
	)

	@registerTask(
		"minify"
		"Minify built files."
		[
			"js-min"
			"css-min"
		]
	)

	@registerTask(
		"deploy-build"
		"Produces the production files"
		[
			"build"
			"minify"
			"pages:theme"
			"docs-min"
			"demos-min"
			"sri"
		]
	)

	@registerTask(
		"build-pkg-json"
		"Build package.json for deployment"
		->
			pkgOriginal = grunt.file.readJSON("package.json");
			addToRepo = "wet-boew-cdn";
			writeTo = "dist/wet-boew/package.json";
			pkg = {
				name: "wet-boew",
				version: pkgOriginal.version,
				description: pkgOriginal.name.toLowerCase() + " theme"
				repository: {
					type: "git",
					url: "git+https://github.com/wet-boew/" + addToRepo + ".git"
				},
				author: "wet-boew-bot",
				license: "MIT",
				bugs: {
					url: "https://github.com/wet-boew/" + pkgOriginal.name.toLowerCase() + "/issues"
				},
				homepage: "https://github.com/wet-boew/" + addToRepo + "#readme"
			};
			grunt.file.write(writeTo, JSON.stringify(pkg, null, 2));

	)

	@registerTask(
		"init"
		"Only needed when the repo is first cloned"
		[
#			"modernizr"
		]
	)

	@registerTask(
		"server"
		"Run the Connect web server for local repo"
		[
			"connect:server"
			"watch"
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
			"stylelint:scss"
			"sass"
			"concat:supports"
			"postcss"
			"stylelint:unmin"
			"usebanner:css"
		]
	)

	@registerTask(
		"css-min"
		"INTERNAL: Minify the CSS files"
		[
			"cssmin:dist"
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
			"stylelint:demos"
			"pages:demos"
			"pages:ajax"
		]
	)

	@registerTask(
		"docs"
		"INTERNAL: Create unminified docs"
		[
			"pages:docs"
			"copy:docs"
		]
	)

	@registerTask(
		"docs-min"
		"INTERNAL: Create minified docs"
		[
			"docs"
			"cssmin:docs_min"
			"copy:docs_min"
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
		"INTERNAL: Runs testing tasks"
		[
			"eslint"
			"sasslint"
			"lintspaces"
		]
	)

	@registerTask(
		"pre-mocha"
		"INTERNAL: prepare for running Mocha unit tests"
		() ->
			grunt.task.run [
				"concat:test"
				"copy:test"
				"pages:test"
			]

	)

	@registerTask(
		"pages"
		"Task to intelligently call Assemble targets"
		( target ) ->
			if target == "min"
				# Run the minifier and update asset paths
				grunt.task.run(
					"htmlmin"
					"useMinAssets"
				)
			else

				if target != "test" and grunt.config "i18n_csv.assemble.locales" is undefined
					grunt.task.run(
						"i18n_csv:assemble"
					)

				# Only use a target path for assemble if pages received one too
				target = if target then ":" + target else ""
				grunt.task.run(
					"assemble" + target
				)
	)

	@registerTask(
		"useMinAssets"
		"Replace unmin references with the min paths for HTML files"
		() ->
			htmlFiles = grunt.file.expand(
				"dist/**/*.html"
				"!dist/unmin/**/*.html"
			)

			htmlFiles.forEach(
				( file ) ->
					contents = grunt.file.read file
					contents = contents.replace /\.\.\/(wet\-boew|theme\-wet\-boew)/g, "$1"
					contents = contents.replace /\"(?!https:\/\/github\.com)([^\"]*)?\.(js|css)\"/g, "\"$1.min.$2\""

					grunt.file.write file, contents
			)
	)

	globalConnectMiddleware = (connect, middlewares) ->
		middlewares.unshift(
			connect.compression filter: (req, res) ->
				/json|text|javascript|dart|image\/svg\+xml|application\/x-font-ttf|application\/vnd\.ms-opentype|application\/vnd\.ms-fontobject/.test res.getHeader("Content-Type")
		)

	@util.linefeed = "\n"
	# Project configuration.
	@initConfig

		# Metadata.
		pkg: @file.readJSON "package.json"
		coreDist: "dist/wet-boew"
		themeDist: "dist/theme-wet-boew"
		jqueryVersion: "<%= pkg.dependencies.jquery %>"
		banner: "/*!\n * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)\n * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html\n" +
				" * v<%= pkg.version %> - " + "<%= grunt.template.today('yyyy-mm-dd') %>\n *\n */"
		modernizrBanner: "/*! Modernizr (Custom Build) | MIT & BSD */\n"
		i18nGDocsID: "1BmMrKN6Rtx-dwgPNEZD6AIAQdI4nNlyVVVCml0U594o"
		i18nGDocsSheet: 1

		# Commit Messages
		commitMessage: " Commit wet-boew/wet-boew#" + process.env.TRAVIS_COMMIT
		travisBuildMessage: "Travis build " + process.env.TRAVIS_BUILD_NUMBER
		distDeployMessage: ((
			if process.env.TRAVIS_TAG
				"Production files for the " + process.env.TRAVIS_TAG + " release."
			else
				"<%= travisBuildMessage %>"
		)) + "<%= commitMessage %>"
		cdnDeployMessage: ((
			if process.env.TRAVIS_TAG
				"CDN files for the " + process.env.TRAVIS_TAG + " release."
			else
				"<%= travisBuildMessage %>"
		)) + "<%= commitMessage %>"

		deployBranch: "v4.0-dist"

		checkDependencies:
			all:
				options:
					npmInstall: false

		clean:
			dist: ["dist"]

		# Task configuration.
		wget:
			i18n:
				options:
					overwrite: true
				src: "https://docs.google.com/spreadsheets/d/<%= i18nGDocsID %>/export?gid=<%= i18nGDocsSheet %>&format=csv"
				dest: "src/i18n/i18n.csv"

		concat:
			options:
				banner: "<%= banner %><%= modernizrBanner %>"

			core:
				options:
					stripBanners: false
				src: [
					"node_modules/dompurify/dist/purify.js"
					"src/core/dep/jquery-fix.js"
					"src/core/dep/modernizr-custom.js"
					"src/shims/**/*.js"
					"src/core/wb.js"
					"src/core/helpers.js"
					"src/plugins/**/*.js"
					"!src/plugins/**/test.js"
					"!src/plugins/**/assets/*.js"
					"!src/plugins/**/demo/*.js"
					"!src/plugins/**/deps/*.*"
				]
				dest: "<%= coreDist %>/js/wet-boew.js"

			coreIE8:
				options:
					banner: "<%= banner %>"
					stripBanners: false
				src: [
					"src/core/ie8-wet-boew.js"
				]
				dest: "<%= coreDist %>/js/ie8-wet-boew.js"

			pluginsIE8:
				options:
					banner: "<%= banner %>"
					stripBanners: false
				src: [
					"src/core/ie8-wet-boew2.js"
				]
				dest: "<%= coreDist %>/js/ie8-wet-boew2.js"

			test:
				src: [
					"src/test.js"
					"src/**/test.js"
					"!src/polyfills/datepicker/test.js"
				]
				dest: "dist/unmin/test/tests.js"

			i18n:
				options:
					banner: ""
					process: ( src, filepath ) ->
						lang = filepath.replace grunt.config( "coreDist" ) + "/js/i18n/", ""
						# jQuery validation uses an underscore for locals
						lang = lang.replace "_", "-"
						validationPath = "node_modules/jquery-validation/dist/localization/"

						# Check and append message file
						messagesPath = validationPath + "messages_" + lang
						messages = if grunt.file.exists messagesPath then grunt.file.read messagesPath else ""

						# Check and append method file
						methodsPath = validationPath + "methods_" + lang
						methods = if grunt.file.exists methodsPath then grunt.file.read methodsPath else ""

						if methods != "" or messages != ""
							src += "\nwb.doc.one( \"formLanguages.wb\", function() {\n"
							src += messages
							src += "\n"
							src += methods
							src += "\n});"

						return src

				cwd: "<%= coreDist %>/js/i18n"
				src: [
					"*.js"
					"!*.min.js"
				]
				dest: "<%= coreDist %>/js/i18n"
				expand: true

			supports:
				options:
					stripBanners: false
				src: [
					"<%= themeDist %>/css/theme.css"
					"src/polyfills/supports/*.css"
				]
				dest: "<%= themeDist %>/css/theme.css"

		usebanner:
			css:
				options:
					banner: "@charset \"utf-8\";\n<%= banner %>"
					position: "replace"
					replace: "@charset \"UTF-8\";"
				files:
					src: [
						"<%= coreDist %>/css/*.*"
						"<%= themeDist %>/css/*.*"
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
				helpers: "site/helpers/helper{,s}-*.js"
				partials: [
					"site/includes/**/*.hbs"
					"src/other/archived/demo/archived.scss"
					"src/plugins/eqht-css/demo/eqht-css.scss"
					"src/plugins/equalheight/demo/equalheight.scss"
					"src/plugins/share/demo/share.scss"
					"src/polyfills/datalist/demo/datalist_dynamic.js"
				]
				layoutdir: "site/layouts"
				layout: "default.hbs"
				environment:
					root: "/v4.0-ci/unmin"
					jqueryVersion: "<%= jqueryVersion %>"
				assets: "dist/unmin"

			theme:
				options:
					flatten: true
					languages: "<%= i18n_csv.assemble.locales %>"
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
							"!**/test.hbs"
							"!ajax/**/*.hbs"
							"!docs/**/*.hbs"
						]
						dest: "dist/unmin"
						expand: true
				]

			test:
				options:
					offline: true
				expand: true
				cwd: "site/pages"
				src: "test/test.hbs"
				dest: "dist/unmin"

			splash:
				expand: true
				cwd: "site/pages"
				src: "index.hbs"
				dest: "dist/unmin"

			docs:
				cwd: "site/pages"
				src: [
					"docs/**/*.hbs"
				]
				dest: "dist/unmin"
				expand: true

		#Generate the sprites including the stylesheet
		sprite:
			share:
				src: "src/plugins/share/sprites/*.png"
				destCss: "src/plugins/share/sprites/_sprites_share.scss"
				dest: "src/plugins/share/assets/sprites_share.png"
				imgPath: '#{$wb-assets-path}/sprites_share.png'

		lintspaces:
			all:
				src: [
						# Root files
						".*rc"
						".editorconfig"
						".eslint*"
						".git*"
						".*.{json,yml}"
						".npmignore"
						"*.{json,md}"
						"Gruntfile.coffee"
						"Licen?e-*.txt"
						"Rakefile"

						# Folders
						"dep/**"
						"script/**"
						"site/**"
						"src/**"
						"theme/**"

						# Exemptions...

						# Images
						"!site/pages/docs/img/*.{jpg,png}"
						"!src/plugins/**/*.{jpg,png}"
						"!src/polyfills/**/*.{jpg,png}"
						"!theme/assets/*.{ico,jpg,png}"

						# Docker environment file
						# Empty file that gets populated in a manner that goes against .editorconfig settings during the main Travis-CI build.
						"!script/docker/env"

						# Tracked third party files
						# Prevents lintspaces from immediately aborting upon encountering .editorconfig properties that use the "unset" value.
						"!dep/modernizr-custom.js"
						"!src/polyfills/events/mobile.js"
						"!src/polyfills/slider/slider.js"

						# Untracked generated files
						"!site/data/i18n/*.json"
						"!src/plugins/*/sprites/_sprites_*.scss"
					],
				options:
					editorconfig: ".editorconfig",
					ignores: [
						"js-comments"
					],
					showCodes: true

		sasslint:
			options:
				configFile: ".sass-lint.yml"
			all:
				expand: true
				src: [
						"site/**/*.scss"
						"src/**/*.scss"
						"theme/**/*.scss"
						"!src/**/sprites/**"
					]

		# Compiles the Sass files
		sass:
			options:
				implementation: sass,
				includePaths: [
					"node_modules"
				],
				indentType: "tab",
				indentWidth: 1
			all:
				files: [
					expand: true
					cwd: "src/base"
					src: [
						"**/*.scss"
						"!**/demo/*.scss"
					]
					dest: "<%= coreDist %>/css/"
					ext: ".css"
				,
					expand: true
					cwd: "theme"
					src: [
						"**/*.scss"
					]
					dest: "<%= themeDist %>/css/"
					ext: ".css"
				,
					expand: true
					cwd: "src/polyfills"
					src: [
						"**/*.scss"
						"!**/*-base.scss"
						"!**/*-noscript.scss"
						"!**/demo/*.scss"
					]
					dest: "<%= coreDist %>/css/polyfills/"
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
				,
					expand: true
					cwd: "site/pages/docs/css"
					src: "**/*.scss"
					dest: "dist/unmin/docs/css/"
					ext: ".css"
				]

		postcss:
			# Only vendor prefixing
			modern:
				options:
					processors: [
						require("autoprefixer")()
					]
				files: [
					{
						cwd: "<%= coreDist %>/css"
						src: [
							"*.css"
						]
						dest: "<%= coreDist %>/css"
						expand: true
					}

					{
						cwd: "<%= themeDist %>/css"
						src: [
							"**/*.css"
						]
						dest: "<%= themeDist %>/css"
						expand: true
					}
				]

			# Mixed vendor prefixing
			mixed:
				options:
					processors: [
						require("autoprefixer")()
					]
				files: [
					cwd: "<%= coreDist %>/css/polyfills"
					src: [
						"**/*.css"
					]
					dest: "<%= coreDist %>/css/polyfills/"
					expand: true
				,
					cwd: "dist"
					src: [
						"demos/**/*.css"
						"docs/**/*.css"
					]
					dest: "dist"
					expand: true
				]

		stylelint:
			options:
				configFile: ".stylelintrc.yml"

			unmin:
				src: [
					"<%= coreDist %>/**/*.css"
					"<%= themeDist %>/**/*.css"
					"!dist/**/*.min.css"
				]

			demos:
				src: "dist/unmin/demos/**/*.css"

			scss:
				src: "**/*.scss"

		# Minify
		uglify:
			options:
				output:
					comments: (uglify,comment) ->
						return comment.value.match /^!/i

			polyfills:
				options:
					banner: "<%= banner %>"
					sourceMap: true
				expand: true
				cwd: "<%= coreDist %>/js/polyfills/"
				src: "*.js"
				dest: "<%= coreDist %>/js/polyfills/"
				ext: ".min.js"

			demos:
				options:
					banner: "<%= banner %>"
				expand: true
				cwd: "dist/unmin/demos/"
				src: "**/demo/*.js"
				dest: "dist/demos/"
				ext: ".min.js"

			core:
				options:
					beautify:
						beautify: false
						quote_keys: true
					sourceMap: true
				cwd: "<%= coreDist %>/js/"
				src: [
					"*wet-boew*.js"
					"!*.min.js"
				]
				dest: "<%= coreDist %>/js/"
				ext: ".min.js"
				expand: true

			coreIE8:
				options:
					beautify:
						beautify: false
				cwd: "<%= coreDist %>/js/"
				src: [
					"ie8*.js"
					"!*.min.js"
				]
				dest: "<%= coreDist %>/js/"
				ext: ".min.js"
				expand: true

			i18n:
				options:
					banner: "<%= banner %>"
				expand: true
				cwd: "<%= coreDist %>/js/i18n"
				src: [
					"**/*.js"
					"!**/*.min.js"
				]
				dest: "<%= coreDist %>/js/i18n"
				ext: ".min.js"

			deps:
				options:
					preserveComments: "some"
				expand: true
				cwd: "<%= coreDist %>/js/deps"
				src: [
					"*.js"
					"!*.min.js"
				]
				dest: "<%= coreDist %>/js/deps/"
				ext: ".min.js"
				extDot: "last"

		cssmin:
			options:
				banner: ""
			dist:
				options:
					banner: ""
				expand: true
				src: [
					"<%= coreDist %>/**/*.css"
					"<%= themeDist %>/**/*.css"
					"!**/*.min.css"
				]
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

			docs_min:
				options:
					banner: "@charset \"utf-8\";\n<%= banner %>"
				expand: true
				cwd: "dist/unmin/docs/"
				src: [
					"**/*.css"
				]
				dest: "dist/docs/"
				ext: ".min.css"

		htmlmin:
			options:
				collapseWhitespace: true
				preserveLineBreaks: true
				preventAttributesEscaping: true
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
						"Element “head” is missing a required instance of child element “title”."
					]
				src: [
					"dist/unmin/ajax/**/*.html"
					"dist/unmin/demos/menu/demo/*.html"
				]

			ajaxFragments:
				options:
					ignore: [
						"Element “head” is missing a required instance of child element “title”."
						"Element “li” not allowed as child of element “body” in this context. (Suppressing further errors from this subtree.)"
						"Start tag seen without seeing a doctype first. Expected “<!DOCTYPE html>”."
						"Section lacks heading. Consider using “h2”-“h6” elements to add identifying headings to all sections."
					]
					noLangDetect: true
				src: [
					"dist/unmin/demos/**/ajax/**/*.html"
					"dist/unmin/assets/*.html"
					"!dist/unmin/demos/data-ajax/ajax/data-ajax-template-fr.html"
					"!dist/unmin/demos/data-ajax/ajax/data-ajax-template-en.html"
				]

			lightbox:
				options:
					ignore: [
						# TODO: Remove longdesc attributes without hindering user agents/screen readers that still support longdesc
						"The “longdesc” attribute on the “img” element is obsolete. Use a regular “a” element to link to the description."
						# TODO: Should be removed and fixed now that HTML5 specs updated
						"The “main” role is unnecessary for element “main”."
						"The “contentinfo” role is unnecessary for element “footer”."
						"The “navigation” role is unnecessary for element “nav”."
						"The “banner” role is unnecessary for element “header”."
					]
				src: [
					"dist/unmin/demos/lightbox/*.html"
				]

			reports:
				options:
					ignore: [
						# TODO: Should be removed and fixed now that HTML5 specs updated
						"The “main” role is unnecessary for element “main”."
						"The “contentinfo” role is unnecessary for element “footer”."
						"The “navigation” role is unnecessary for element “nav”."
						"The “banner” role is unnecessary for element “header”."
						"Attribute “href” without an explicit value seen. The attribute may be dropped by IE7."
						"The text content of element “time” was not in the required format: The literal did not satisfy the time-datetime format."
					]
				src: [
					"dist/unmin/**/reports/*.html"
					"dist/unmin/**/demo/*.html"
					"dist/unmin/**/demo-*/*.html"
				]

			all:
				options:
					ignore: [
						# TODO: Should be removed and fixed now that HTML5 specs updated
						"The “main” role is unnecessary for element “main”."
						"The “contentinfo” role is unnecessary for element “footer”."
						"The “navigation” role is unnecessary for element “nav”."
						"The “banner” role is unnecessary for element “header”."
						"Attribute “href” without an explicit value seen. The attribute may be dropped by IE7."
					]
				src: [
					"dist/unmin/**/*.html"
					"!dist/unmin/**/ajax/**/*.html"
					"!dist/unmin/assets/**/*.html"
					"!dist/unmin/demos/lightbox/*.html"
					"!dist/unmin/demos/menu/demo/*.html"
					"!dist/unmin/test/**/*.html"
					"!dist/unmin/**/reports/*.html"
					"!dist/unmin/**/demo/*.html"
					"!dist/unmin/**/demo-*/*.html"
				]

		bootlint:
			all:
				options:
					stoponerror: true
					stoponwarning: true
					showallerrors: true
					relaxerror: [
						"W002" # `<head>` is missing X-UA-Compatible `<meta>` tag that disables old IE compatibility modes
						"W005" # Unable to locate jQuery, which is required for Bootstrap's JavaScript plugins to work; however, you might not be using Bootstrap's JavaScript
						# Opinionated exclusions
						"W007" # Found one or more `<button>`s missing a `type` attribute.
						# TODO: The rules below should be resolved
						"W009" # Using empty spacer columns isn't necessary with Bootstrap's grid. So instead of having an empty grid column with `class=\"col-xs-12"` , just add `class=\"col-xs-offset-12"` to the next grid column.
						"W010" # Using `.pull-left` or `.pull-right` as part of the media object component is deprecated as of Bootstrap v3.3.0. Use `.media-left` or `.media-right` instead.
						"E013" # Only columns (`.col-*-*`) may be children of `.row`s
						"E014" # Columns (`.col-*-*`) can only be children of `.row`s or `.form-group`s
						"E031" # Glyphicon classes must only be used on elements that contain no text content and have no child elements.
						"E032" # `.modal-content` must be a child of `.modal-dialog`
						"E049" # `.modal-dialog` must have a `role="document"` attribute.
						"E051" # `.pull-right` and `.pull-left` must not be used on `.col-*-*` elements
					]
				src: [
					"dist/**/*.html"
					# Ignore HTML fragments used for the menus
					"!dist/**/assets/*.html"
					"!dist/**/ajax/*.html"
				]

# Remove modernizr temp
#		modernizr:
#			dist:
#				devFile: "lib/modernizr/modernizr-custom.js"
#				outputFile: "lib/modernizr/modernizr-custom.js"
#				extra:
#					shiv: false
#					printshiv: false
#					load: true
#					mq: true
#					css3: true
#					input: true
#					inputtypes: true
#					svg: true
#					html5: false
#					cssclasses: true
#					csstransitions: true
#					fontface: true
#					backgroundsize: true
#					borderimage: true
#				extensibility:
#					addtest: false
#					prefixed: false
#					teststyles: true
#					testprops: true
#					testallprops: true
#					hasevents: true
#					prefixes: true
#					domprefixes: true
#				tests: [
#					"elem_details"
#					"elem_progress_meter"
#					"mathml"
#					"cors"
#				]
#				parseFiles: false
#				matchCommunityTests: false

		copy:
			bootstrap:
				cwd: "node_modules/bootstrap-sass/assets/fonts/bootstrap"
				src: "*.*"
				dest: "<%= coreDist %>/fonts"
				expand: true
				flatten: true

			test:
				files: [
					cwd: "src"
					src: [
						"**/test/*.*"
					]
					dest: "dist/unmin/test"
					rename: (dest, src) ->
						dest + src.replace /plugins|polyfills|others/, ""
					expand: true
				,
					cwd: "node_modules"
					src: [
						"mocha/mocha.js"
						"mocha/mocha.css"
						"expect.js/index.js"
						"sinon/pkg/sinon.js"
					]
					dest: "dist/unmin/test"
					expand: true
					flatten: true
				]

			js:
				files: [
					cwd: "src/polyfills"
					src: "**/*.js"
					dest: "<%= coreDist %>/js/polyfills"
					expand: true
					flatten: true
				,
					cwd: "lib"
					src: [
						"flot/jquery.flot.js"
						"flot/jquery.flot.pie.js"
						"flot/jquery.flot.canvas.js"
						"SideBySideImproved/jquery.flot.orderBars.js"
						"openlayers/OpenLayers.debug.js"
					]
					dest: "<%= coreDist %>/js/deps"
					rename: (dest, src) ->
						return dest + "/" + src.replace ".debug", ""
					expand: true
					flatten: true
				,
					cwd: "node_modules"
					src: [
						"code-prettify/src/*.js"
						"datatables.net/js/jquery.dataTables.js"
						"jquery-validation/dist/jquery.validate.js"
						"jquery-validation/dist/additional-methods.js"
						"magnific-popup/dist/jquery.magnific-popup.js"
						"proj4/dist/proj4.js"
						"unorm/lib/unorm.js"
					]
					dest: "<%= coreDist %>/js/deps"
					rename: (dest, src) ->
						return dest + "/" + src.replace ".debug", ""
					expand: true
					flatten: true
				,
					cwd: "node_modules/mathjax/es5"
					src: [
						"mml-chtml.js"
						"output/chtml/fonts/woff-v2/**"
					]
					dest: "<%= coreDist %>/js/MathJax/"
					expand: true
				,
					cwd: "node_modules/jquery/dist"
					src: "*.*"
					dest: "<%= coreDist %>/js/jquery/<%= jqueryVersion %>"
					expand: true
				,
					cwd: "src"
					src: [
						"plugins/**/assets/*"
						"polyfills/**/assets/*"
					]
					dest: "<%= coreDist %>/assets"
					expand: true
					flatten: true
				,
					cwd: "src/plugins"
					src: [
						"**/deps/*.js"
					]
					dest: "<%= coreDist %>/js/deps"
					expand: true
					flatten: true
				,
					cwd: "node_modules"
					src: [
						"openlayers/dist/ol.js"
					]
					dest: "<%= coreDist %>/js/deps"
					expand: true
					flatten: true
				,
					cwd: "node_modules"
					src: [
						"jsonpointer.js/src/jsonpointer.js",
						"fast-json-patch/src/json-patch.js"
					]
					dest: "<%= coreDist %>/js/deps"
					expand: true
					flatten: true
				]

			demos:
				files: [
					cwd: "src/plugins"
					src: [
						"**/*.{jpg,html,xml,json}"
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
						"**/demo*/*.*"
						"!**/*.scss"
					]
					dest: "dist/unmin/demos/"
					expand: true
				]

			docs:
				cwd: "site/pages/docs"
				src: "**/img/*.*"
				dest: "dist/unmin/docs"
				expand: true

			demos_min:
				cwd: "dist/unmin/demos"
				src: [
					"**/*.{jpg,html,xml,json}"
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

			docs_min:
				cwd: "dist/unmin/docs"
				src: "**/img/*.*"
				dest: "dist/docs"
				expand: true

			themeAssets:
				cwd: "theme/"
				src: "assets/*.*"
				dest: "<%= themeDist %>"
				expand: true

			deploy:
				files: [
					{
						src: [
							"*.txt"
							"*.html"
							"README.md"
						]
						dest: "dist"
						expand: true
					}

					{
						src: "*.txt"
						dest: "<%= coreDist %>"
						expand: true
					}

					{
						src: "*.txt"
						dest: "<%= themeDist %>"
						expand: true
					}

					#Backwards compatibility.
					#TODO: Remove in v4.1
					{
						cwd: "<%= coreDist %>"
						src: [
							"**/*.*"
						]
						dest: "dist"
						expand: true
					}

					{
						cwd: "<%= themeDist %>"
						src: [
							"**/*.*"
						]
						dest: "dist"

						expand: true
					}
				]

				#Backwards compatibility.
				#TODO: Remove in v4.1
				options:
					noProcess: [
						'**/*.{png,gif,jpg,ico,ttf,eot,otf,woff,svg,swf}'
					]
					process: (content, filepath) ->
						if filepath.match /\.css/
							return content.replace /\.\.\/\.\.\/wet-boew\/(assets|fonts)/g, '../$1'
						content


		watch:
			options:
				livereload: true
			js:
				files: "<%= eslint.all.src %>"
				tasks: [
					"js"
				]
			css:
				files: [
					"src/**/*.scss"
					"site/**/*.scss"
					"theme/**/*.scss"
				]
				tasks: "css"
			json:
				files: "src/**/*.json*"
				tasks: "copy:demos"

			demos:
				files: "src/**/*.hbs"
				tasks: "pages:demos"

			docs:
				files: "site/pages/docs/**/*.hbs"
				tasks: "pages:docs"

		eslint:
			options:
				configFile: if process.env.CI == "true" then ".eslintrc.ci.json" else ".eslintrc.json"
				quiet: true
			all:
				src: [
					"site/**/*.js"
					"src/**/*.js"
					"theme/**/*.js"
				]

		connect:
			options:
				port: 8000

			server:
				options:
					base: "dist"
					middleware: (connect, options, middlewares) ->
						# globalConnectMiddleware connect, middlewares

						middlewares.unshift (req, res, next) ->
							req.url = req.url.replace "/v4.0-ci/", "/"
							next()

						# Serve the custom error page
						middlewares.push (req, res) ->
							filename = options.base + req.url

							if not grunt.file.exists filename
								filename = options.base + "/404.html"

								# Set the status code manually
								res.statusCode = 404

							res.end( grunt.file.read filename )

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
				dest: "<%= coreDist %>/js/i18n/"
			assemble:
				dest: 'site/data/i18n'

		"gh-pages":
			options:
				clone: "wet-boew-dist"
				base: "dist"

			travis:
				options:
					repo: process.env.DIST_REPO
					branch: "<%= deployBranch %>"
					message: "<%= distDeployMessage %>"
					tag: ((
						if process.env.TRAVIS_TAG then process.env.TRAVIS_TAG else false
					))
				src: [
					"**/*.*"
					"!package.json"
				]

			travis_cdn:
				options:
					repo: process.env.CDN_REPO
					branch: "<%= deployBranch %>"
					clone: "wet-boew-cdn"
					base: "<%= coreDist %>"
					message: "<%= cdnDeployMessage %>"
					tag: ((
						if process.env.TRAVIS_TAG then process.env.TRAVIS_TAG else false
					))
				src: [
					"**/*.*"
				]

			travis_theme_cdn:
				options:
					repo: process.env.THEME_CDN_REPO
					branch: "theme-wet-boew"
					clone: "wet-boew-theme-cdn"
					base: "<%= themeDist %>"
					message: "<%= cdnDeployMessage %>"
					tag: ((
						if process.env.TRAVIS_TAG then process.env.TRAVIS_TAG + "-theme-wet-boew" else false
					))
				src: [
					"**/*.*"
				]

			local:
				src: [
					"**/*.*"
				]

		"wb-update-examples":
			travis:
				options:
					repo: process.env.DEMOS_REPO
					branch: process.env.DEMOS_BRANCH
					message: "<%= distDeployMessage %>"
				src: [
					"**/*.*"
					"!package.json"
				]

		sri:
			options:
				pretty: true
			wet_boew:
				options:
					dest: "<%= coreDist %>/payload.json"
				cwd: "<%= coreDist %>"
				src: [
					"{js,css}/**/*.{js,css}"
				]
				expand: true
			theme:
				options:
					dest: "<%= themeDist %>/payload.json"
				cwd: "<%= themeDist %>"
				src: [
					"{js,css}/*.{js,css}"
				]
				expand: true

		markdownlint:
			all:
				options:
					config: grunt.file.readJSON(".markdownlint.json")
				src: [
					'**/*.md'
					'!node_modules/**/*.md'
					'!lib/**/*.md'
				]

	require( "load-grunt-tasks" )( grunt, requireResolution: true )

	require( "time-grunt" )( grunt )
	@

#WET-BOEW Vapour loader
Vapour Object that will store tombstone data for plugins to leverage

	do ( $ = jQuery, window, document, undef = undefined ) ->
		$src = $('script[src$="vapour.js"],script[src$="vapour.min.js"]').last()
		$homepath = $src.prop("src").split('?')[0].split('/').slice(0, -1).join('/')
		$mode = if $src.prop("src").indexOf('.min') < 0 then '' else '.min'
		vapour =
			'/': $homepath
			'/assets': "#{$homepath}/assets"
			'/templates': "#{$homepath}/assets/templates"
			'/deps': "#{$homepath}/deps"
			'mode': $mode
			'doc': $(document)
			'win': $(window)

			getPath: (prty)->
				res = if @hasOwnProperty(prty) then @[prty] else undef
				return res

			getMode: ()->
				return @mode

		window.vapour = vapour


Establish the base path to be more flexible in terms of WCMS where JS can reside in theme folders and not in the root of sites

	do (yepnope, vapour) ->
		yepnope.addPrefix "site", (resourceObj) ->
			_path = vapour.getPath('/')
			resourceObj.url = _path +  "/" + resourceObj.url
			resourceObj

## Base timer
The base timer for all event driven plugins

	;window._timer =
		_elms: []
This gives a performance boost to allow for body targeting.
		_cache : []

		add: (_rg) ->

Simple init pattern to ensure body element is available to the window timer

			if @_cache.length < 1 then @_cache = $(document.body)
continue

			_obj = @_cache.find(_rg)
			@_elms.push _obj if (_obj.length > 0)
			undefined

		remove: (_rg) ->
			i = @_elms.length - 1

			while i >= 0
				@_elms.splice i, 1  if @_elms[i].selector is _rg
				i--
			undefined
		start: ()->
			setInterval (->
				window._timer.touch()
			), 500
			undefined
		touch: ->
			i = @_elms.length - 1

			while i >= 0
				@_elms[i].trigger "timerpoke.wb"
				i--
			undefined


## Using Modernizer to load the polyfills

	;Modernizr.load [

Test for Canvas support

			test: Modernizr.canvas
			nope: "site!polyfills/excanvas#{vapour.getMode()}.js"
		,

Test for details/summary element

			test: Modernizr.details
			nope: "site!polyfills/detailssummary#{vapour.getMode()}.js"
		,

Test for datalist support

			test: Modernizr.input.list
			nope : "site!polyfills/datalist#{vapour.getMode()}.js"
		,

Test for range element

			test: Modernizr.inputtypes["range"]
			nope : "site!polyfills/slider#{vapour.getMode()}.js"
		,

Test for sessionStorage

			test: Modernizr.sessionstorage
			nope : "site!polyfills/sessionstorage#{vapour.getMode()}.js"
		,

Test for progress element

			test: Modernizr.progress
			nope : "site!polyfills/progress#{vapour.getMode()}.js"
		,

Test for meter element

			test: Modernizr.meter
			nope : "site!/polyfills/meter#{vapour.getMode()}.js"
		,

Test for localStorage

			test: Modernizr.localstorage
			nope : "site!polyfills/sessionstorage#{vapour.getMode()}.js"
		,

Test for touch support

			test: Modernizr.touch
			yep : "site!polyfills/mobile#{vapour.getMode()}.js"
		,

Test for JAWS fixes

			test: navigator.userAgent.indexOf("Win") isnt -1 and navigator.userAgent.match(/^((?!mobi|tablet).)*$/i) isnt null
			yep : "site!polyfills/jawsariafixes#{vapour.getMode()}.js"
		,
			complete: ()->
				window._timer.start()
	]

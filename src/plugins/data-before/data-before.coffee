###
	Web Experience Toolkit (WET) / Boîte à outils de l\'expérience Web (BOEW)
	_plugin : Ajax Loader [ data-append ]
	_author : World Wide Web
	_notes: A basic AjaxLoader wrapper for WET-BOEW that appends to elements
	_licence: wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
###

do ($ = jQuery, window, document) ->
	$document = $(document)
	$.ajaxSettings.cache = false;

	$document.on "wb.timerpoke", "[data-ajax-before]", (event) ->
		console.log "ok ajax-after inited"
		window._timer.remove "[data-ajax-before]"
		_elm = $(@)
		_url = _elm.data("ajax-before")
		$document.trigger
			type: "wb.ajax-fetch"
			element: _elm
			fetch: _url
		undefined

	$document.on "wb.ajax-fetched", "[data-ajax-before]", (event) ->
		_elm = $(@)
		_elm.before event.pointer.html()
		_elm.trigger "wb.ajax-after-loaded"
		undefined
	# Register Ajax Replacement
	window._timer.add "[data-ajax-before]"

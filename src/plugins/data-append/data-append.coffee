###
	Web Experience Toolkit (WET) / Boîte à outils de l\'expérience Web (BOEW)
	_plugin : Ajax Loader [ data-append ]
	_author : World Wide Web
	_notes	: A basic AjaxLoader wrapper for WET-BOEW that appends to elements
	_licence: wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
###

do ($ = jQuery, window, vapour) ->
	$document = vapour.doc
	$.ajaxSettings.cache = false

	$document.on "timerpoke.wb ajax-fetched.wb", "[data-ajax-append]", (event) ->
		eventType = event.type
		_elm = $(@)
		switch eventType
			when "timerpoke"
				window._timer.remove "[data-ajax-append]"
				_url = _elm.data("ajax-append")
				$document.trigger
					type: "ajax-fetch.wb"
					element: _elm
					fetch: _url
				undefined

			when "ajax-fetched"
				_elm.append event.pointer.html()
				_elm.trigger "ajax-append-loaded.wb"
				undefined

	# Register Ajax Replacement
	window._timer.add "[data-ajax-append]"

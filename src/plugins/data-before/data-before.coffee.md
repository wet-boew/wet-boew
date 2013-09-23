# Ajax Loader [ data-append-before ]
A basic AjaxLoader wrapper for WET-BOEW that appends to elements

	do ( $ = jQuery, window, vapour ) ->
		$document = vapour.doc
		$.ajaxSettings.cache = false

		$document.on "timerpoke.wb ajax-fetched.wb", "[data-ajax-before]", ( event ) ->
			eventType = event.type
			switch eventType
				when "timerpoke"
					window._timer.remove "[data-ajax-before]"
					_elm = $(@)
					_url = _elm.data "ajax-before"
					$document.trigger
						type: "ajax-fetch.wb"
						element: _elm
						fetch: _url
					undefined

				when "ajax-fetched"
					_elm = $(@)
					_elm.before event.pointer.html()
					_elm.trigger "ajax-after-loaded.wb"
					undefined

Register Ajax Replacement

		window._timer.add "[data-ajax-before]"

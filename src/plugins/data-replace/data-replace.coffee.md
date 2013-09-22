# Ajax Loader [ data-replace ]
A basic AjaxLoader wrapper for WET-BOEW

	do ( $ = jQuery, window, vapour ) ->
		$document = vapour.doc
		$.ajaxSettings.cache = false

		$document.on "timerpoke.wb", "[data-ajax-replace]", ( event ) ->
			_elm = $( @ )
			_url = _elm.data "ajax-replace"
			_elm.load _url, ->
				$(@).trigger "ajax-replace-loaded.wb"

Remove the event from continous throddling

			window._timer.remove "[data-ajax-replace]"
			undefined

Register Ajax Replacement

		window._timer.add "[data-ajax-replace]"

#Ajax Fetch
A basic AjaxLoader wrapper for WET-BOEW that appends to elements

	do ( $ = jQuery, window, vapour ) ->
		$document = vapour.doc
		$.ajaxSettings.cache = false

## Internal core functions

		generateSerial = ( len ) ->
			chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz"
			string_length = 10
			randomstring = ""
			x = 0

			while x < string_length
				letterOrNumber = Math.floor( Math.random() * 2 )
				if letterOrNumber is 0
					newNum = Math.floor( Math.random() * 9 )
					randomstring += newNum
				else
					rnum = Math.floor( Math.random() * chars.length )
					randomstring += chars.substring( rnum, rnum + 1 )
				x++
				randomstring

## Event handler

		$document.on "ajax-fetch.wb", ( event ) ->

			_caller  = event.element
			_url = event.fetch
			_id = "wb#{generateSerial(8)}"


			$( "<div id='#{_id}' />" ).load _url, ->
				$( _caller ).trigger
					type: "ajax-fetched.wb"
					pointer: $( @ )

			undefined

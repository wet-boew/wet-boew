###
	Web Experience Toolkit (WET) / Boîte à outils de l\'expérience Web (BOEW)
	_plugin : Ajax Fetch [ ajax-fetch ]
	_author : World Wide Web
	_notes	: A basic AjaxLoader wrapper for WET-BOEW that appends to elements
	_licence: wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
###

do ($ = jQuery, window, vapour) ->
	$document = vapour.doc
	$.ajaxSettings.cache = false

	### internal core functions ###

	generateSerial = (len) ->
	  chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz"
	  string_length = 10
	  randomstring = ""
	  x = 0

	  while x < string_length
	    letterOrNumber = Math.floor(Math.random() * 2)
	    if letterOrNumber is 0
	      newNum = Math.floor(Math.random() * 9)
	      randomstring += newNum
	    else
	      rnum = Math.floor(Math.random() * chars.length)
	      randomstring += chars.substring(rnum, rnum + 1)
	    x++
	  randomstring


	$document.on "wb.ajax-fetch", (event) ->

		_caller  = event.element
		_url = event.fetch
		_id = "wb#{generateSerial(8)}"


		$("<div id=\"#{_id}\" />").load _url, ->
			$(_caller).trigger
				type: "wb.ajax-fetched"
				pointer: $(@)

		undefined

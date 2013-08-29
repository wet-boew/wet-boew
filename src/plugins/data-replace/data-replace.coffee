###
	Web Experience Toolkit (WET) / Boîte à outils de l\'expérience Web (BOEW) 
	_plugin : Ajax Loader [ data-replace ]
	_author : World Wide Web
	_notes: A basic AjaxLoader wrapper for WET-BOEW
	_licence: wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt
###

do ($ = jQuery, window, document) ->
	$.ajaxSettings.cache = false;
	$(document).on "wb.timerpoke", "[data-ajax-replace]", (event) ->
	  _elm = $(@)
	  _url = _elm.data("ajax-replace")
	  _elm.load _url, ->
	    $(@).trigger "wb.ajax-replace-loaded"
	  # lets remove the event from continous throddling
	  window._timer.remove "[data-ajax-replace]"
	  undefined

	# Register Ajax Replacement
	window._timer.add "[data-ajax-replace]"
###
	Web Experience Toolkit (WET) / Boîte à outils de l\'expérience Web (BOEW) 
	_plugin : Ajax Loader [ data-replace ]
	_author : World Wide Web
	_notes	: A basic AjaxLoader wrapper for WET-BOEW
	_licence: wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
###

do ($ = jQuery, window, vapour) ->
	$document = vapour.doc
	$.ajaxSettings.cache = false

	$document.on "timerpoke.wb", "[data-ajax-replace]", (event) ->
	  _elm = $(@)
	  _url = _elm.data("ajax-replace")
	  _elm.load _url, ->
	  	_elm.removeAttr('data-ajax-replace').trigger "ajax-replace-loaded.wb"
	  # lets remove the event from continous throddling
	  window._timer.remove "[data-ajax-replace]"
	  undefined

	# Register Ajax Replacement
	window._timer.add "[data-ajax-replace]"
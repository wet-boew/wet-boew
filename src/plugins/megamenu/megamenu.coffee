###
	Web Experience Toolkit (WET) / Boîte à outils de l\'expérience Web (BOEW) 
	_plugin : Mega Menu
	_author : World Wide Web
	_notes: A Mega Menu for WET
	_licence: wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt
###

do ($ = jQuery, window, document) ->
	$(document).on "wb.ajax-replace-loaded", ".wb-menu", (event) ->
	  # Act on the event
	  _elm = $(this)
	  _wlist = _elm.find("li:has(.drp-dwn)")
	  _wlist.find("> :header").addClass("wb-tle-lnk").append "<span class=\"expandicon\"></span>"
	  _wlist.attr("aria-haspopup", "false").attr "role", "presentation"
	# add link attribute for easier CSS targeting
	# add the down arrows
	$(document).on "mouseenter focusin", ".wb-menu li:has(.drp-dwn)", (event) ->
	  # Act on the event
	  _elm = $(this)
	  _elm.parents(".wb-menu").first().find("[aria-haspopup]").attr "aria-haspopup", "false" # reset the menu's
	  _elm.attr "aria-haspopup", "true"

	# add the down arrows
	$(document).on "mouseleave focusout", ".wb-menu", (event) ->
	  # Act on the event
	  _elm = $(this)
	  _elm.find("[aria-haspopup]").attr "aria-haspopup", "false" # reset the menu's

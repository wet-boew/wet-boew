###
	Web Experience Toolkit (WET) / Boîte à outils de l\'expérience Web (BOEW)
	_plugin : Mega Menu
	_author : World Wide Web
	_notes: A Mega Menu for WET
	_licence: wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
###

do ($ = jQuery, window, document) ->

	$(document).on "wb.ajax-replace-loaded", ".wb-menu", (event) ->
		event.stopPropagation()
		_elm = $(@)
		_links = _elm.find ".menu li"
		_links.find("a[href^='#'']").append "<span class=\"expandicon\"></span>"
		_links.each (index)->
			$(@).attr('data-index', index)
		undefined

	$(document).on "wb.menu-reset", ".wb-menu", (event) ->
		event.stopPropagation()
		$(@).find('.open').removeClass('open')
		undefined

	###
	 Generic Selection of item Event
	###
	$(document).on "wb.menu-select-item", ".wb-menu .item", (event) ->
		event.stopPropagation()
		_elm = $(@).addClass('open').find(':tabable').first()
		setTimeout ( ->
  				_elm.focus()
		), 1
		undefined
	###
	 Generic exact selection of menu-item
	###
	$(document).on "wb.menu-select-exact", ".wb-menu .menu :tabable", (event) ->
		event.stopPropagation()
		_elm = $(@)
		setTimeout ( ->
  				_elm.focus()
		), 1
		undefined
	###
	 Generic incrementing selection of Menu Event
	###
	$(document).on "wb.menu-menu-increment", ".wb-menu", (event) ->
		event.stopPropagation()
		_menu = $(@)
		_links = _menu.find('.menu :tabable')
		_next =  event.current + event.increment
		_index = _next

		if _next >= _links.length
			_index = 0
		if _next < 0
			_index = _links.length-1

		_elm = $(@).find('.menu [data-index="' + _index + '"] :tabable')
		setTimeout ( ->
  				_elm.focus()
		), 1
		undefined
	###
	 Generic incrementing selection of items Event
	###
	$(document).on "wb.menu-item-increment", ".wb-menu", (event) ->
		event.stopPropagation()
		_menu = $(@)
		_links = _menu.find('.item :tabable')
		_next =  event.current + event.increment
		_index = _next

		if _next >= _links.length
			_index = 0
		if _next < 0
			_index = _links.length-1

		setTimeout ( ->
  				_links.get(_index).focus()
		), 1
		undefined
	###
	 Mouse In and Out
	###
	$(document).on "mouseenter focusin", ".wb-menu .menu :tabable", (event) ->
	  # Act on the event
	  event.stopPropagation()
	  _elm = $(@)
	  _menu = _elm.parents('.wb-menu').trigger('wb.menu-reset')
	  # clean up
	  _target = _elm.attr('href')
	  if _target.indexOf('#') is 0
	  	# this is a page reference
	  	console.log _target
	  	$(_target).addClass('open')
	###
	 Keyboard Navigation
	###
	# Primary links in list
	$(document).on "keydown", ".wb-menu .menu :tabable", (event) ->
		event.stopPropagation()
		code = event.which;
		_elm = $(event.target)
		_index = parseInt(_elm.parents('[data-index]').data('index'))
		if _elm.find('.expandicon').length > 0
			# ok we have a menu we want to listen for
			if code is 13 or code is 40
				event.preventDefault()
				$(_elm.attr('href')).trigger('wb.menu-select-item')
		if code is 37
			# left arrow
			event.preventDefault()
			_elm.parents('.wb-menu').trigger
				type: 'wb.menu-menu-increment'
				increment: -1
				current: _index
		if code is 39
			# right arrow
			event.preventDefault()
			_elm.parents('.wb-menu').trigger
				type: 'wb.menu-menu-increment'
				increment: 1
				current: _index
	# This is for the events for secondary items
	$(document).on "keydown", ".wb-menu .item", (event) ->
		event.stopPropagation()
		code = event.which;
		_elm = $(@)
		_index = _elm.find(':tabable').index($(event.target))
		_menu = _elm.parents('.wb-menu')
		if code is 27 or code is 37
			event.preventDefault()
			_menu.find('.menu [href="#' + _elm.attr('id') + '"]').trigger 'wb.menu-select-exact'
		# TODO: right-arrow
		if code is 40
			event.preventDefault()
			_menu.trigger
				type: 'wb.menu-item-increment'
				increment: 1
				current: _index

		if code is 38
			event.preventDefault()
			_menu.trigger
				type: 'wb.menu-item-increment'
				increment: -1
				current: _index

	$(document).on "mouseleave focusout", ".wb-menu", (event) ->
		$(@).trigger('wb.menu-reset')



###
.find(':tabable:first');
	  	_tar.addClass "open"
	  	setTimeout ( ->
  				tar.focus()
		), 1
###

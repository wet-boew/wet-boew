###
	Web Experience Toolkit (WET) / Boîte à outils de l\'expérience Web (BOEW)
	_plugin : Menu Plugin
	_author : World Wide Web
	_notes: A Menu plugin for WET
	_licence: wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
###

do ($ = jQuery, window, document) ->

	$document = $(document)
	###
	Lets leverage JS assigment deconstruction to reduce the code output
	###
	expand = (elment, scopeitems)->
		$elm = $(elment)
		_elm = if $elm.hasClass('wb-menu') then $elm else $elm.parents('.wb-menu').first()
		_items = if (scopeitems) then _elm.data('items').has(elment) else _elm.data('items')
		[_elm.data('self'), _elm.data('menu'), _items, $elm]

	###
	Init
	###
	$document.on "wb.ajax-replace-loaded", ".wb-menu", (event) ->
		event.stopPropagation()
		$container = $(@)
		$menu = $container.find ".menu :focusable"
		$items = $container.find ".item"
		# lets store the object for maximun performance - prevent the jQuery overhead re-querying
		$container.data('self', $container).data('menu', $menu).data('items',$items)
		# lets disable tabbing through the menu for usability - leaving the first element open to the tab order
		$container.find(':discoverable').attr('tabindex', '-1').eq(0).attr('tabindex', '0')
		# lets add our down arrows where we need to
		$menu.filter("[href^='#']").append "<span class=\"expandicon\"></span>"
		undefined

	###
	 Menu Keyboard bindings
	###
	$document.on "mouseover focusin", ".wb-menu .menu :focusable", (event) ->
		event.stopPropagation()
		[$container, $menu, $items, $elm] = expand(event.target)
		# some housecleaning
		$menu.trigger('wb.reset')
		# end of housecleaning
		if $elm.find('.expandicon').length > 0
			$menu.trigger
					type: 'wb.display'
					ident: $elm.attr('href')

	$document.on "keydown", ".wb-menu .menu", (event) ->
		event.stopPropagation()
		[$container, $menu, $items, $elm] = expand(event.target)
		$code = event.which
		$index = $menu.index($elm.get(0))
		if $elm.find('.expandicon').length > 0
			# ok we have a menu we want to listen for
			if $code is 13 or $code is 40
				event.preventDefault()
				$anchor = $elm.attr('href').slice(1)
				$goto = $items.filter('[id="' + $anchor + '"]').find(':discoverable').first()
				console.log $anchor
				$container.trigger
					type: 'wb.display'
					ident: $elm.attr('href')
				.trigger
					type: 'wb.select'
					goto: $goto
		# since we have set the tabindex on elements the tabkey event should only
		# ever close the menu since it is only used to enter and leave the menu
		if $code is 9
			$container.trigger
				type: 'wb.reset'
		if $code is 37
			# left arrow
			event.preventDefault()
			$container.trigger
				type: 'wb.increment'
				cnode:  $menu
				increment: -1
				current: $index
		if $code is 39
			# right arrow
			event.preventDefault()
			$container.trigger
				type: 'wb.increment'
				cnode:  $menu
				increment: 1
				current: $index

	###
	 Item Keyboard bindings
	###
	$document.on "keydown", ".wb-menu .item", (event) ->
		event.stopPropagation()
		[$container, $menu, $items, $elm] = expand(event.target, true)
		$code = event.which
		$links = $items.find(':focusable')
		$index = $links.index($elm.get(0))

		# escape key
		if $code is 27 or $code is 37
			event.preventDefault()
			# look into this more
			$goto = $menu.filter('[href="#' + $items.attr('id') + '"]')
			$container.trigger
				type: 'wb.select'
				goto: $goto

		if $code is 38
			# up arrow
			event.preventDefault()
			$container.trigger
				type: 'wb.increment'
				cnode:  $links
				increment: -1
				current: $index

		if $code is 40
			# down arrow
			event.preventDefault()
			$container.trigger
				type: 'wb.increment'
				cnode:  $links
				increment: 1
				current: $index

	###
	 Global Menu Events
	###
	$document.on "mouseleave focusout", ".wb-menu", (event) ->
		$(@).trigger('wb.menu-reset')


	$document.on "wb.select", ".wb-menu", (event) ->
		event.stopPropagation()
		$elm = event.goto
		setTimeout ( ->
  				$elm.focus()
		), 1

	$document.on "wb.increment", ".wb-menu", (event)->
		event.stopPropagation()
		$container = $(@)
		$links = event.cnode
		$next =  event.current + event.increment
		$index = $next

		if $next >= $links.length
			$index = 0
		if $next < 0
			$index = $links.length - 1

		$container.trigger
			type: "wb.select"
			goto: $links.eq($index)
		undefined

	###
	 Helper Events
	###

	# Clear all open menus
	$document.on "wb.reset", ".wb-menu", (event) ->
		event.stopPropagation()
		$container = $(@)
		$container.find('.open').removeClass('open')
		$container.find('.active').removeClass('active')


	$document.on "wb.display", ".wb-menu", (event) ->
		event.stopPropagation()
		$container = $(@)
		# lets reset the menu
		$container.trigger
			type: 'wb.reset'
		# add the active class to the menu item
		$container.find(".menu [href='#{event.ident}']").addClass('active')
		$container.find(event.ident).addClass('open')





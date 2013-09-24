###
	Web Experience Toolkit (WET) / Boîte à outils de l\'expérience Web (BOEW)
	_plugin : Menu Plugin
	_author : World Wide Web
	_notes	: A Menu plugin for WET
	_licence: wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
###

do ($ = jQuery, window, vapour) ->
	$document = vapour.doc

	###
	Lets leverage JS assigment deconstruction to reduce the code output
	###
	expand = (elment, scopeitems)->
		$elm = $(elment)
		_elm = if $elm.hasClass('wb-menu') then $elm else $elm.parents('.wb-menu').first()
		_items = if (scopeitems) then _elm.data('items').has(elment) else _elm.data('items')
		[_elm.data('self'), _elm.data('menu'), _items, $elm]

	$document.on "ajax-replace-loaded.wb mouseleave focusout select.wb increment.wb reset.wb display.wb", ".wb-menu", (event) ->
		eventType = event.type
		$container = $(@)
		switch eventType
			# Init
			when "ajax-replace-loaded"
				event.stopPropagation()
				###
				Some hooks for post transformation
				 - @data-post-remove : removes the space delimited class for the element. This is more a feature to fight the FOUC 
				###
				if $container.has('[data-post-remove]')
					$container.removeClass($container.data('post-remove')).removeAttr('data-post-remove')

				$menu = $container.find ".menu :focusable"
				$items = $container.find ".item"
				# lets disable tabbing through the menu for usability - leaving the first element open to the tab order
				$container.find(':discoverable').attr('tabindex', '-1').eq(0).attr('tabindex', '0')
				# lets add our down arrows where we need to
				$menu.filter("[href^='#']").append "<span class=\"expandicon\"></span>"
				# lets store the object for maximun performance - prevent the jQuery overhead re-querying
				$container.data('self', $container).data('menu', $menu).data('items',$items)
				undefined

			# Global Menu Events
			when "mouseleave", "focusout"
				$container.trigger('reset.wb')

			when "select"
				event.stopPropagation()
				$elm = event.goto
				setTimeout ( ->
						$elm.focus()
				), 1

			when "increment"
				event.stopPropagation()
				$links = event.cnode
				$next =  event.current + event.increment
				$index = $next

				if $next >= $links.length
					$index = 0
				if $next < 0
					$index = $links.length - 1

				$container.trigger
					type: "select.wb"
					goto: $links.eq($index)
				undefined

			# Helper Events
			when "reset"
				# Clear all open menus
				event.stopPropagation()
				$container.find('.open').removeClass('open')
				$container.find('.active').removeClass('active')

			when "display"
				event.stopPropagation()
				# lets reset the menu
				$container.trigger
					type: 'reset.wb'
				# add the active class to the menu item
				$container.find(".menu [href='#{event.ident}']").addClass('active')
				$container.find(event.ident).addClass('open')

	###
	Menu Keyboard bindings
	###
	$document.on "mouseover focusin", ".wb-menu .menu :focusable", (event) ->
		event.stopPropagation()
		[$container, $menu, $items, $elm] = expand(event.target)
		# some housecleaning
		$menu.trigger('reset.wb')
		# end of housecleaning
		if $elm.find('.expandicon').length > 0
			$menu.trigger
					type: 'display.wb'
					ident: $elm.attr('href')

	$document.on "keydown", ".wb-menu .menu", (event) ->
		event.stopPropagation()
		[$container, $menu, $items, $elm] = expand(event.target)
		$code = event.which
		$index = $menu.index($elm.get(0))
		switch $code
			when 13, 40
				if $elm.find('.expandicon').length > 0
					# ok we have a menu we want to listen for
					event.preventDefault()
					$anchor = $elm.attr('href').slice(1)
					$goto = $items.filter('[id="' + $anchor + '"]').find(':discoverable').first()
					console.log $anchor
					$container.trigger
						type: 'display.wb'
						ident: $elm.attr('href')
					.trigger
						type: 'select.wb'
						goto: $goto

			# since we have set the tabindex on elements the tabkey event should only
			# ever close the menu since it is only used to enter and leave the menu
			when 9
				$container.trigger
					type: 'reset.wb'

			# left arrow
			when 37
				event.preventDefault()
				$container.trigger
					type: 'increment.wb'
					cnode:  $menu
					increment: -1
					current: $index

			# right arrow
			when 39
				event.preventDefault()
				$container.trigger
					type: 'increment.wb'
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

		switch $code
			# escape key
			when 27, 37
				event.preventDefault()
				# look into this more
				$goto = $menu.filter('[href="#' + $items.attr('id') + '"]')
				$container.trigger
					type: 'select.wb'
					goto: $goto

			# up arrow
			when 38
				event.preventDefault()
				$container.trigger
					type: 'increment.wb'
					cnode:  $links
					increment: -1
					current: $index

			# down arrow
			when 40
				event.preventDefault()
				$container.trigger
					type: 'increment.wb'
					cnode:  $links
					increment: 1
					current: $index

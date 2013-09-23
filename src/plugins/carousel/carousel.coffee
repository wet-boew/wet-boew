###
	Web Experience Toolkit (WET) / Boîte à outils de l\'expérience Web (BOEW) 
	_plugin : JavaScript Carousel
	_author : World Wide Web
	_notes  : A JavaScript carousel for WET-BOEW
	_licence: wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
###

do ($ = jQuery, window, vapour) ->
	$document = vapour.doc

	$document.on "timerpoke.wb carousel-init.wb shift.wb", ".wb-carousel", (event) ->
		eventType = event.type
		_sldr = $(this)
		switch eventType
			when "timerpoke"
				if (typeof _sldr.attr("data-delay")) is "undefined"
					_sldr.trigger "carousel-init.wb"
					return undefined

				# state stopped
				return undefined  if _sldr.hasClass("stopped")
			  
				# continue;
				_setting = parseFloat(_sldr.attr("data-delay"))
			  
				# add settings and counter
				_delay = parseFloat(_sldr.attr("data-ctime"))
				_delay += 0.5
			  
				# check if we need
				if _setting < _delay
					_sldr.trigger "shift.wb"
					_delay = 0
				_sldr.attr "data-ctime", _delay

			# ------ Init --------------
			when "carousel-init"
				_interval = 6
				_interval = 9  if _sldr.hasClass("slow")
				_interval = 3  if _sldr.hasClass("fast")
				_sldr.find(".item:not(.in)").addClass "out"
				_sldr.attr("data-delay", _interval).attr "data-ctime", 0

			# ------ Change Slides --------------
			when "shift"
				_items = _sldr.find(".item")
				_current = _items.index(".in")
				_next = (if (event.shiftto) then event.shiftto else (if ((_current + 1) > _items.length) then 0 else _current + 1))
				_items.eq(_current).removeClass("in").addClass "out"
				_items.eq(_next).removeClass("out").addClass "in"

	# ------ Next / Prev --------------
	$document.on "click", ".wb-carousel .prv, .wb-carousel .nxt, .wb-carousel .plypause", (event) ->
		event.preventDefault()
		_elm = $(this)
		_sldr = _elm.parents(".wb-carousel")
		_items = _sldr.find(".item")
		_current = parseInt(_items.index(".in"))
		_current = (if (_current < 0) then 0 else _current)
		_action = _elm.attr("class")
		switch _action
			when "prv"
				_next = (if ((_current - 1) < 0) then _items.length - 1 else _current - 1)
				_elm.trigger "shift.wb",
					shiftto: _next

			when "nxt"
				_next = (if ((_current + 1) > _items.length) then 0 else _current + 1)
				_elm.trigger "shift.wb",
					shiftto: _next

			else # playpause
				_sldr.toggleClass "stopped"
		_sldr.attr "data-ctime", 0 # all clicks reset the clock;

	# ------ Register carousel --------------
	window._timer.add ".wb-carousel"

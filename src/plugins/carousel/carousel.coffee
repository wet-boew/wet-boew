###
	Web Experience Toolkit (WET) / Boîte à outils de l\'expérience Web (BOEW) 
	_plugin : Javascript Carousel
	_author : World Wide Web
	_notes  : A javascript carousel for WET-BOEW
	_licence: wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt
###
do ($ = jQuery, window, document) ->
	$(document).on "wb.timerpoke", ".wb-carousel", (event) ->
	  _sldr = $(this)
	  if (typeof _sldr.attr("data-delay")) is "undefined"
	    _sldr.trigger "carousel.init.wb"
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
	    _sldr.trigger "wb.shift"
	    _delay = 0
	  _sldr.attr "data-ctime", _delay


	# ------ Init --------------
	$(document).on "carousel.init.wb", ".wb-carousel", (event) ->
	  _sldr = $(this)
	  _interval = 6
	  _interval = 9  if _sldr.hasClass("slow")
	  _interval = 3  if _sldr.hasClass("fast")
	  _sldr.find(".item:not(.in)").addClass "out"
	  _sldr.attr("data-delay", _interval).attr "data-ctime", 0


	# ------ Next / Prev --------------
	$(document).on "click", ".wb-carousel .prv, .wb-carousel .nxt, .wb-carousel .plypause", (event) ->
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
	      _elm.trigger "wb.shift",
	        shiftto: _next

	    when "nxt"
	      _next = (if ((_current + 1) > _items.length) then 0 else _current + 1)
	      _elm.trigger "wb.shift",
	        shiftto: _next

	    else # playpause
	      _sldr.toggleClass "stopped"
	  _sldr.attr "data-ctime", 0 # all clicks reset the clock;


	# ------ Change Slides --------------
	$(document).on "wb.shift", ".wb-carousel", (event) ->
	  _sldr = $(this)
	  _items = _sldr.find(".item")
	  _current = _items.index(".in")
	  _next = (if (event.shiftto) then event.shiftto else (if ((_current + 1) > _items.length) then 0 else _current + 1))
	  _items.eq(_current).removeClass("in").addClass "out"
	  _items.eq(_next).removeClass("out").addClass "in"

	# ------ Register carousel --------------
	window._timer.add ".wb-carousel"

#Data Inview Plugin
A simplified data-attribute driven plugin that responds to moving in and out of the viewport.


	do( $ = jQuery, window, vapour) ->
		$document = vapour.doc

## Initialization

		$document.on "timerpoke.wb", ".wb-inview", ( event )->
			$window = vapour.win
			window._timer.remove ".wb-inview"

			$this = $( @ )
			$message = $this.find ".pg-banner, .pg-panel"
			$message.attr( "role", "toolbar" ).attr( "aria-hidden", "true" )

Set some events to help manage this control

			$window.on "scroll scrollstop resize", ( event )->
				$this.trigger "scroll.wb-inview"

Set the element listeners

			$this.on "scroll.wb-inview", ( event )->
				_elm = $( @ )
				_viewport = $window

Start computing values

				elementWidth = _elm.outerWidth()
				elementHeight = _elm.outerHeight()
				viewportWidth = _viewport.width()
				viewportHeight = _viewport.height()
				scrollTop = _viewport.scrollTop()
				scrollLeft = _viewport.scrollLeft()
				scrollRight = scrollLeft + elementWidth
				scrollBottom = scrollTop + viewportHeight
				x1 = _elm.offset().left
				x2 = x1 + elementWidth
				y1 = _elm.offset().top
				y2 = y1 + elementHeight

Evaluate if the target is inside the viewport

				if (scrollBottom < y1 or scrollTop > y2) or (scrollRight < x1 or scrollRight > x2)
					$message.removeClass( "in" ).addClass( "out" ).wb( "hide", true )
				else
					$message.removeClass( "out" ).addClass( "in" ).wb( "show", true )
				undefined


Trigger to ensure our elements are or are not in view

			$this.trigger "scroll.wb-inview"

Global Registration

		window._timer.add(".wb-inview")


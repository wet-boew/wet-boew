###
	Web Experience Toolkit (WET) / Boîte à outils de l\'expérience Web (BOEW)
	_plugin : Data Inview Plugin v1.0
	_author : WET Community
	_notes	: A simplified data-attribute driven plugin that responds to moving in and out of the viewport.
	_licence: wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
###

do( $ = jQuery, window, vapour) ->
	$document = vapour.document

	# Initialization
	$document.on 'wb.timerpoke', '.wb-inview', (e)->
		window._timer.remove '.wb-inview'

		$this = $(@)
		$message = $this.find('.pg-banner, .pg-panel')
		# set some settings
		$message.attr('role','toolbar').attr('aria-hidden','true')
		# lets set some events to help manage this control

		# bind our event
		$(window).on 'scroll scrollstop resize', (e)->
			$this.trigger 'scroll.wb-inview'

		# set the element listeners
		$this.on 'scroll.wb-inview', (e)->
			_elm = $(@)
			_viewport = $(window)
			# lets start computing values
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
			# Evaluate if the target is inside the viewport
			if (scrollBottom < y1 or scrollTop > y2) or (scrollRight < x1 or scrollRight > x2)
				$message.removeClass('in').addClass('out').wb('hide', true);
			else
				$message.removeClass('out').addClass('in').wb('show', true);
			undefined


		# trigger to ensure our elements are or are not in view
		$this.trigger 'scroll.wb-inview'

	# Global Registration
	window._timer.add('.wb-inview')


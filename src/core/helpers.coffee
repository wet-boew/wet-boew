###
JQuery Helper Methods v1.0
Release: 31/07/2013
Author: WET Community
Credits: http://kaibun.net/blog/2013/04/19/a-fully-fledged-coffeescript-boilerplate-for-jquery-plugins/


Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
###

do ( $ = jQuery, window, document ) ->
	$this = undefined

	_settings =
		default: 'wet-boew'

	methods =
		init: (options) ->
			$this = $(@)
			$.extend _settings, (options or {})
			return $this
		show: (onlyAria) ->
			$this = $(@)
			return $this.each ()->
				elm = $(@)
				elm.attr 'aria-hidden', 'false'
				unless onlyAria?
					elm.removeClass 'wb-invisible'
		hide: (onlyAria) ->
			$this = $(@)
			return $this.each ()->
				elm = $(@)
				elm.attr 'aria-hidden', 'true'
				unless onlyAria?
					elm.addClass 'wb-invisible'
		toggle: (to, from) ->
      $(@).addClass(to).removeClass(from)
	$.fn.wb = (method) ->
		if methods[method]
			methods[method].apply @, Array::slice.call(arguments, 1)
		else if typeof method is "object" or not method
			methods.init.apply @, arguments
		else
			$.error "Method " + method + " does not exist on jquery.wb"


do ( $ = jQuery, window, document ) ->

  ###
  A collection of functions to determine if an element is tabbable

  @class Subject
  @static
  ###
  Subject =

    FOCUSSABLE_ELEMS: ["input", "select", "textarea", "button"]


    isTabbable: (elem) ->
      Subject.hasTabindex(elem) and Subject.isFocussable(elem) and Subject.isVisible(elem)

    hasTabindex: (elem) ->
      elem.tabIndex >= 0

    isVisible: (elem) ->
      $(elem).is ":visible"


    isFocussable: (elem) ->
      node = elem.nodeName
      regex = new RegExp(Subject.FOCUSSABLE_ELEMS.join("|"), "gi")
      return true  if regex.test(node) and not elem.disabled
      return true  if /a/i.test(node) and elem.href
      false

  # Adds a tabbable pseudo selector to jQuery
  $.expr[":"].tabable = Subject.isTabbable

#!
# * jQuery outside events - v1.1 - 3/16/2010
# * http://benalman.com/projects/jquery-outside-events-plugin/
# *
# * Copyright (c) 2010 "Cowboy" Ben Alman
# * Dual licensed under the MIT and GPL licenses.
# * http://benalman.com/about/license/
#


#
#  OUTSIDE EVENT     - ORIGINATING EVENT
#  clickoutside      - click
#  dblclickoutside   - dblclick
#  focusoutside      - focusin
#  bluroutside       - focusout
#  mousemoveoutside  - mousemove
#  mousedownoutside  - mousedown
#  mouseupoutside    - mouseup
#  mouseoveroutside  - mouseover
#  mouseoutoutside   - mouseout
#  keydownoutside    - keydown
#  keypressoutside   - keypress
#  keyupoutside      - keyup
#  changeoutside     - change
#  selectoutside     - select
#  submitoutside     - submit

do ( $ = jQuery, doc = document, outside = "outside" ) ->

  jq_addOutsideEvent = (event_name, outside_event_name) ->



    # When the "originating" event is triggered..
    handle_event = (event) ->

      # Iterate over all elements to which this "outside" event is bound.
      $(elems).each ->
        elem = $(this)

        # If this element isn't the element on which the event was triggered,
        # and this element doesn't contain said element, then said element is
        # considered to be outside, and the "outside" event will be triggered!

        # Use triggerHandler instead of trigger so that the "outside" event
        # doesn't bubble. Pass in the "originating" event's .target so that
        # the "outside" event.target can be overridden with something more
        # meaningful.
        elem.triggerHandler outside_event_name, [event.target]  if this isnt event.target and not elem.has(event.target).length

    outside_event_name = outside_event_name or event_name + outside
    elems = $()
    event_namespaced = event_name + "." + outside_event_name + "-special-event"
    $.event.special[outside_event_name] =
      setup: ->
        elems = elems.add(this)
        $(doc).bind event_namespaced, handle_event  if elems.length is 1

      teardown: ->
        elems = elems.not(this)
        $(doc).unbind event_namespaced  if elems.length is 0

      add: (handleObj) ->
        old_handler = handleObj.handler
        handleObj.handler = (event, elem) ->
          event.target = elem
          old_handler.apply this, arguments_

  $.map "click dblclick mousemove mousedown mouseup mouseover mouseout change select submit keydown keypress keyup".split(" "), (event_name) ->
    jq_addOutsideEvent event_name

  jq_addOutsideEvent "focusin", "focus" + outside
  jq_addOutsideEvent "focusout", "blur" + outside
  $.addOutsideEvent = jq_addOutsideEvent

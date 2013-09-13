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
	$.fn.wb = (method) ->
		if methods[method]
			methods[method].apply @, Array::slice.call(arguments, 1)
		else if typeof method is "object" or not method
			methods.init.apply @, arguments
		else
			$.error "Method " + method + " does not exist on jquery.wb"


do ( $ = jQuery, window, document ) ->

	# Visible not disabled elements can have focus.
	# Pretends that image maps don't exist.
	# http://mark-story.com/posts/view/creating-custom-selectors-with-jquery
	canFocus = (element, hasTabIndex) ->
	  nodeName = element.nodeName.toLowerCase()

	  # Similar to $(element).is(':visible');
	  return $.expr.filters.visible(element)  if /input|select|textarea|button|object/.test(nodeName) and not element.disabled

	  # Similar to $(element).is(':visible');
	  return $.expr.filters.visible(element)  if nodeName is "a" and element.href or tabIndex
	  false

	# Add the :tabable filter.
	$.expr.filters.tabable = (element) ->
	  tabIndex = $.attr(element, "tabindex")
	  tabIndexNan = isNaN(tabIndex)
	  canFocus element, tabIndexNan  if tabIndexNan or tabIndex >= 0

###
JQuery Helper Methods v1.0
Release: 31/07/2013
Author: WET Community
Credits: http://kaibun.net/blog/2013/04/19/a-fully-fledged-coffeescript-boilerplate-for-jquery-plugins/


Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt
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

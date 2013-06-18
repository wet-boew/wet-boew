###
	Web Experience Toolkit (WET) / Boîte à outils de l\'expérience Web (BOEW)
	_plugin : equalize
	_author : World Wide Web
	_licence: wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt
###
(($)->
	_equalize = (_elm)->
		_group = $(_elm).find('> [class*="span-"] > *')
		_group.css "min-height" , "0"
		if (_group.length > 0)
			tallest = 0;
			_group.each ()->
				thisHeight = $(@).height()
				tallest = thisHeight if (thisHeight > tallest)
			_group.css "min-height" , "#{tallest}px"
		undefined
 	$(document).on 'pagebeforecreate throttledresize','.equalize', ()->
 		_equalize(@)
 		undefined
 	undefined
)(jQuery)

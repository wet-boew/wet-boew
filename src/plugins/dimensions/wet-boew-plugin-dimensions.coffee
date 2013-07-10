###
	Web Experience Toolkit (WET) / Boîte à outils de l\'expérience Web (BOEW)
	_plugin : dimensions
	_author : World Wide Web
	_notes: A dimensions plugin for WET-BOEW
	_licence: wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt
###
(($) ->
  _calculate_width = undefined
  _calculate_width = ->
    $("[class*=\"span-\"]").children().each ->
      _elm = undefined
      _elm = $(this)
      _elm.find(".dimensions").remove()  if _elm.find(".dimensions")
      _elm.append "<small class=\"dimensions\">width: " + (_elm.width()) + "</small>"

    undefined

  _calculate_width()
  $(window).resize ->
    _calculate_width()
    undefined

  undefined
) jQuery

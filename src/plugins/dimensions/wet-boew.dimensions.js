/*
	Web Experience Toolkit (WET) / Boîte à outils de l\'expérience Web (BOEW)
	_plugin : dimensions
	_author : World Wide Web
	_notes: A dimensions plugin for WET-BOEW
	_licence: wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt
*/

(function($) {
  var _calculate_width;
  _calculate_width = void 0;
  _calculate_width = function() {
    $("[class*=\"span-\"]").children().each(function() {
      var _elm;
      _elm = void 0;
      _elm = $(this);
      if (_elm.find(".dimensions")) {
        _elm.find(".dimensions").remove();
      }
      return _elm.append("<small class=\"dimensions\">width: " + (_elm.width()) + "</small>");
    });
    return void 0;
  };
  _calculate_width();
  $(window).resize(function() {
    _calculate_width();
    return void 0;
  });
  return void 0;
})(jQuery);

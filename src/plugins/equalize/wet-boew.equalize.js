/*
	Web Experience Toolkit (WET) / Boîte à outils de l\'expérience Web (BOEW)
	_plugin : equalize
	_author : World Wide Web
	_licence: wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt
*/

(function($) {
  var _equalize;
  return _equalize = function(_elm) {
    var tallest, _group;
    _group = $(_elm).find('> [class*="span-"] > *');
    _group.css("min-height", "0");
    if (_group.length > 0) {
      tallest = 0;
      _group.each(function() {
        var thisHeight;
        thisHeight = $(this).height();
        if (thisHeight > tallest) {
          return tallest = thisHeight;
        }
      });
      _group.css("min-height", "" + tallest + "px");
    }
    void 0;
    $(document).on('pagebeforecreate throttledresize', '.equalize', function() {
      _equalize(this);
      return void 0;
    });
    return void 0;
  };
})(jQuery);

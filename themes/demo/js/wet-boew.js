/*!
 *
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt
 *
 * Version: @wet-boew-build.version@
 *
 */
/*
 WET-BOEW Functionality
*/

/*
 JEP SECTION
*/

(function($) {
  $(document).on("mouseover", ".dropdown li", function() {
    $(this).addClass("hover");
    $('ul:first', this).css('visibility', 'visible');
    return void 0;
  });
  return $(document).on("mouseout", ".dropdown li", function() {
    $(this).removeClass("hover");
    $('ul:first', this).css('visibility', 'hidden');
    return void 0;
  });
})(jQuery);

(function($) {
  return $(window).on("throttledresize", function() {
    var tallest, _group;
    _group = $('.equalize > [class*="span-"] > *');
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
      return _group.css("min-height", "" + tallest + "px");
    }
  });
})(jQuery);
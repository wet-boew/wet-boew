/* 
	WET-BOEW Vapour loader
*/
(function($) {
  return Modernizr._vpbpath = $('script[src$="vapour.js"]').last().prop("src").split('?')[0].split('/').slice(0, -1).join('/');
})(jQuery);

Modernizr.load([
  {
    test: Modernizr.mq('only all'),
    nope: "" + Modernizr._vpbpath + "/polyfills/respond.min.js"
  }, {
    test: Modernizr.canvas,
    nope: "" + Modernizr._vpbpath + "/polyfills/excanvas.min.js"
  }, {
    test: Modernizr.input.list,
    nope: "" + Modernizr._vpbpath + "/polyfills/datalist.min.js"
  }, {
    test: Modernizr.inputtypes["range"],
    nope: "" + Modernizr._vpbpath + "/polyfills/slider.min.js"
  }, {
    test: Modernizr.sessionstorage,
    nope: "" + Modernizr._vpbpath + "/polyfills/sessionstorage.min.js"
  }, {
    test: Modernizr.progress,
    nope: "" + Modernizr._vpbpath + "/polyfills/progress.min.js"
  }, {
    test: Modernizr.meter,
    nope: "" + Modernizr._vpbpath + "/polyfills/meter.min.js"
  }, {
    test: Modernizr.localstorage,
    nope: "" + Modernizr._vpbpath + "/polyfills/sessionstorage.min.js"
  }, {
    load: "" + Modernizr._vpbpath + "/wet-boew.min.js"
  }, {
    load: "//code.jquery.com/mobile/1.3.1/jquery.mobile-1.3.1.min.js",
    complete: function() {
      if (window.jQuery.mobile != null) {
        return Modernizr.load("" + Modernizr._vpbpath + "/vendor/jquery.mobile-1.3.1.min.js");
      }
    }
  }
]);

/*
	WET-BOEW Vapour loader
*/

(function($) {
  Modernizr._vpbpath = $('script[src$="vapour.js"],script[src$="vapour.min.js"]').last().prop("src").split('?')[0].split('/').slice(0, -1).join('/');
  return console.log(Modernizr._vpbpath);
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
    test: Modernizr.lastchild,
    nope: "" + Modernizr._vpbpath + "/vendor/selectivizr.min.js"
  }, {
    load: "" + Modernizr._vpbpath + "/wet-boew.min.js"
  }
]);

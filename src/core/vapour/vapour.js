/* 
	WET-BOEW Vapour loader
*/
Modernizr.load([
  {
    load: "//code.jquery.com/jquery-1.9.1.min.js",
    complete: function() {
      if (window.jQuery != null) {
        return Modernizr.load("js/vendor/jquery-1.9.1.min.js");
      }
    }
  }, {
    load: "//code.jquery.com/mobile/1.3.0/jquery.mobile-1.3.0.min.js",
    complete: function() {
      if (window.jQuery.mobile != null) {
        return Modernizr.load("js/vendor/jquery.mobile-1.3.0.min.js");
      }
    }
  }, {
    test: Modernizr.input.list,
    nope: 'polyfills/datalist.min.js'
  }, {
    test: Modernizr.inputtypes['range'],
    nope: 'polyfills/slider.min.js'
  }, {
    test: Modernizr.sessionstorage,
    nope: 'polyfills/sessionstorage.min.js'
  }, {
    test: Modernizr.progress,
    nope: 'polyfills/progress.min.js'
  }, {
    test: Modernizr.meter,
    nope: 'polyfills/meter.min.js'
  }, {
    test: Modernizr.localstorage,
    nope: 'polyfills/sessionstorage.min.js'
  }, {
    load: "wet-boew.min.js"
  }
]);

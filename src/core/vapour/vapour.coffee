### 
	WET-BOEW Vapour loader 
###
# Using Modernizer to load the polyfills
Modernizr.load [
	    load : "//code.jquery.com/jquery-1.9.1.min.js",
	    complete :->
	      Modernizr.load "js/vendor/jquery-1.9.1.min.js" if window.jQuery?
    ,
    	load : "//code.jquery.com/mobile/1.3.0/jquery.mobile-1.3.0.min.js",
	    complete :-> 
	      Modernizr.load "js/vendor/jquery.mobile-1.3.0.min.js" if  window.jQuery.mobile?
	,
    	test: Modernizr.input.list,
    	nope : 'polyfills/datalist.min.js'
    ,
    	test: Modernizr.inputtypes['range'],
    	nope : 'polyfills/slider.min.js'
    ,
    	test: Modernizr.sessionstorage,
    	nope : 'polyfills/sessionstorage.min.js'
    ,
    	test: Modernizr.progress,
    	nope : 'polyfills/progress.min.js'
    ,	
    	test: Modernizr.meter
    	nope : 'polyfills/meter.min.js'
    ,	
    	test: Modernizr.localstorage,
    	nope : 'polyfills/sessionstorage.min.js'
    ,
    	load: "wet-boew.min.js"
]
###
	WET-BOEW Vapour loader
###
# Lets establish the base path to be more flexiable in terms of WCMS where JS can reside in theme folders and not in the root of sites
(($)->
    Modernizr._vpbpath = $('script[src$="vapour.js"]').last().prop("src").split('?')[0].split('/').slice(0, -1).join('/')
)(jQuery)

# Using Modernizer to load the polyfills
Modernizr.load [
        ## test for media query support
        test: Modernizr.mq('only all'),
        nope : "#{Modernizr._vpbpath}/polyfills/respond.min.js"
    ,
        ## test for Canvas support
        test: Modernizr.canvas,
        nope: "#{Modernizr._vpbpath}/polyfills/excanvas.min.js"
    ,
    	test: Modernizr.input.list,
    	nope : "#{Modernizr._vpbpath}/polyfills/datalist.min.js"
    ,
    	test: Modernizr.inputtypes["range"],
    	nope : "#{Modernizr._vpbpath}/polyfills/slider.min.js"
    ,
    	test: Modernizr.sessionstorage,
    	nope : "#{Modernizr._vpbpath}/polyfills/sessionstorage.min.js"
    ,
    	test: Modernizr.progress,
    	nope : "#{Modernizr._vpbpath}/polyfills/progress.min.js"
    ,
    	test: Modernizr.meter
    	nope : "#{Modernizr._vpbpath}/polyfills/meter.min.js"
    ,
    	test: Modernizr.localstorage,
    	nope : "#{Modernizr._vpbpath}/polyfills/sessionstorage.min.js"
    ,
	test: Modernizr.lastchild,
    	nope : "#{Modernizr._vpbpath}/vendor/selectivizr.min.js"
    ,
    	load: "#{Modernizr._vpbpath}/wet-boew.min.js"
    ,
        load : "//code.jquery.com/mobile/1.3.1/jquery.mobile-1.3.1.min.js",
        complete :->
          Modernizr.load "#{Modernizr._vpbpath}/vendor/jquery.mobile-1.3.1.min.js" if  window.jQuery.mobile?
    ,
]

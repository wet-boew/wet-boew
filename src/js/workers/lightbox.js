/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * Lightbox plugin
 */
/*global jQuery: false, pe: false, wet_boew_lightbox: false*/
(function ($) {
    var _pe = window.pe || {
		fn : {}
    };
    /* local reference */
    _pe.fn.lightbox = {
		type : 'plugin',
		// This is an example from tabbed interface, to show how to call
		// required libraries
		depends : ['colorbox', 'metadata'],
		// Don't include a mobile function if your plugin shouldn't run in
		// mobile mode.

		_exec : function (elm) {

			// Variables
			var $lb_group, $lb_single, $lb_item, $fb_wrap, opts, overrides;

			// Defaults
			opts = {
				transition : "elastic",
				loop : true,
				current : pe.dic.get("%lightbox-current"),
				previous : pe.dic.get("%previous"),
				next : pe.dic.get("%next"),
				close : pe.dic.get("%close"),
				xhrError : pe.dic.get("%lightbox-xhr-error"),
				imgError : pe.dic.get("%lightbox-img-error"),
				slideshowStart : pe.dic.get("%start") + " " + pe.dic.get("%lightbox-slideshow"),
				slideshowStop : pe.dic.get("%stop") + " " + pe.dic.get("%lightbox-slideshow"),
				slideshow : false,
				slideshowAuto : false
			};

			// Class-based overrides - use undefined where no override of defaults or settings.js should occur
			overrides = {
				transition : (elm.hasClass("transition-fade") ? "fade" : (elm.hasClass("transition-none") ? "none" : undefined)),
				loop : elm.hasClass("loop-none") ? false : undefined,
				slideshow : elm.hasClass("slideshow") ? true : undefined,
				slideshowAuto : elm.hasClass("slideshow-auto") ? true : undefined
			};

			// Extend the defaults with settings passed through settings.js (wet_boew_lightbox), class-based overrides and the data attribute
			$.metadata.setType("attr", "data-wet-boew");
			if (typeof wet_boew_lightbox !== 'undefined' && wet_boew_lightbox !== null) {
				$.extend(opts, wet_boew_lightbox, overrides, elm.metadata());
			} else {
				$.extend(opts, overrides, elm.metadata());
			}

			//$fb_wrap = elm.find('.fancybox-wrap');

			$lb_single = elm.find('.lightbox');

			//$lb_group = elm.find('.lightbox-group');

			$lb_item = elm.find('.lightbox-item').colorbox(opts).each(function () {
				return $(this);
			});

			// return elm;
		} // end of exec
    };
    window.pe = _pe;
    return _pe;
}(jQuery));
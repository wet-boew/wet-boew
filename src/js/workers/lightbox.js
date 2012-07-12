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
				modal : false,
				cyclic : false,
				autoScale : true
			};

			// Class-based overrides - use undefined where no override of defaults or settings.js should occur
			overrides = {
				modal : elm.hasClass("modal") ? true : undefined,
				cyclic : elm.hasClass("cyclic") ? true : undefined,
				autoScale : elm.hasClass("no-auto-scale") ? false : undefined
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

			$lb_item = elm.find('.lightbox-item').colorbox().each(function () {
				return $(this);
			});

			// return elm;
		} // end of exec
    };
    window.pe = _pe;
    return _pe;
}(jQuery));
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
		depends : ['fancybox', 'metadata'],
		// Don't include a mobile function if your plugin shouldn't run in
		// mobile mode.

		_exec : function (elm) {

			// Variables
			var $lb_group, $lb_single, $lb_item, $fb_wrap, opts, overrides;

			// Defaults
			opts = {
				modal : false,
				cyclic : false,
				autoScale : true,
				tpl: {
					error: '<p class="fancybox-error">' + pe.dic.get('%lightbox-error') + '</p>',
					image: '<img class="fancybox-image" src="{href}" alt="" aria-labelledby="gallery_img" />',
					closeBtn: '<div title="' + pe.dic.get('%close') + '" class="fancybox-item fancybox-close" tabindex="-1"></div>',
					next: '<a tabindex="0" title="' + pe.dic.get('%next') + '" class="fancybox-nav fancybox-next"><span></span></a>',
					prev: '<a tabindex="0" title="' +  pe.dic.get('%previous') + '" class="fancybox-nav fancybox-prev"><span></span></a>'
				}
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

			$fb_wrap = elm.find('.fancybox-wrap');

			$lb_single = elm.find('.lightbox');

			$lb_group = elm.find('.lightbox-group');

			$lb_item = elm.find('.lightbox-item').fancybox(opts).each(function () {
				$(this).attr('role', 'button').on("click", function () {
					$fb_wrap.attr('tabindex', '0');
					return $fb_wrap;
				});
				return $(this);
			});

			// Fancybox dependencies modifications
			/* $fb_wrap = elm.find('.fancybox-wrap').each(function () {
				$(this).attr('tabindex','0');
				return $(this);
			});*/

			// return elm;
		} // end of exec
    };
    window.pe = _pe;
    return _pe;
}(jQuery));
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
		groupindex : 0,

		// Don't include a mobile function if your plugin shouldn't run in
		// mobile mode.

		_exec : function (elm) {

			// Variables
			var opts,
				opts2,
				overrides,
				$lb,
				$inline,
				$lbContent,
				open = false;

			// Defaults
			opts = {
				transition : "elastic",
				loop : true,
				current : pe.dic.get("%lb-current"),
				previous : pe.dic.get("%lb-prev"),
				next : pe.dic.get("%lb-next"),
				close : pe.dic.get("%close"),
				xhrError : pe.dic.get("%lb-xhr-error"),
				imgError : pe.dic.get("%lb-img-error"),
				maxWidth : "100%",
				maxHeight : "100%",
				slideshowStart : pe.dic.get("%start") + " " + pe.dic.get("%lb-slideshow"),
				slideshowStop : pe.dic.get("%stop") + " " + pe.dic.get("%lb-slideshow"),
				slideshow : false,
				slideshowAuto : false,
				onComplete : function () {
					if (!open) {
						open = true;
						pe.focus($lbContent);
					}
				},
				onClosed : function () {
					open = false;
				}
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

			// Add touchscreen support for launching the lightbox
			$lb = elm.find('.lb-image, .lb-ajax, .lb-gallery, .lb-hidden-gallery, .lb-gallery-inline, .lb-hidden-gallery-inline').on('vclick', function () {
				$.colorbox.launch(this);
			});

			// Build single images and AJAXed content
			$lb.filter('.lb-image, .lb-ajax').attr('aria-haspopup', 'true').colorbox(opts);

			// Build inline content
			$inline = $lb.filter('.lb-inline').attr('aria-haspopup', 'true');
			if ($inline.length > 0) {
				opts2 = opts;
				$.extend(opts2, {inline: "true"});
				$inline.colorbox(opts2);
			}

			// Build galleries
			opts2 = opts;
			$lb.filter('.lb-gallery, .lb-hidden-gallery').each(function () {
				$.extend(opts2, {rel: 'group' + (pe.fn.lightbox.groupindex += 1)});
				$(this).find('a').attr('aria-haspopup', 'true').colorbox(opts2);
			});

			// Build inline galleries
			opts2 = opts;
			$lb.filter('.lb-gallery-inline, .lb-hidden-gallery-inline').each(function () {
				$.extend(opts2, {inline: 'true', rel: 'group' + (pe.fn.lightbox.groupindex += 1)});
				$(this).find('a').attr('aria-haspopup', 'true').colorbox(opts2);
			});

			// Add WAI-ARIA
			$lbContent = $('body').find('#colorbox #cboxContent').attr('tabindex', '0').attr('role', 'dialog').attr('aria-labelledby', 'cboxTitle cboxCurrent');
			$lbContent.find('#cboxNext, #cboxPrevious, #cboxClose').attr('tabindex', '0').attr('role', 'button').attr('aria-controls', '#cboxContent');

			// Add extra keyboard support (handling for tab, enter and space)
			$lbContent.on('keydown', function (e) {
				var target = $(e.target);
				if (!(e.ctrlKey || e.altKey || e.metaKey)) {
					if (e.keyCode === 9) {
						if ((e.shiftKey && target.attr("id") === "cboxContent") || (!e.shiftKey && target.attr("id") === "cboxClose")) {
							$.colorbox.close();
							return false;
						}
					} else if (e.keyCode === 13 || e.keyCode === 32) {
						if (target.attr("id") === "cboxContent" || target.attr("id") === "cboxNext") {
							$.colorbox.next();
							return false;
						} else if (target.attr("id") === "cboxPrevious") {
							$.colorbox.prev();
							return false;
						} else if (target.attr("id") === "cboxClose") {
							$.colorbox.close();
							return false;
						}
					}
				}
			});
		} // end of exec
    };
    window.pe = _pe;
    return _pe;
}(jQuery));
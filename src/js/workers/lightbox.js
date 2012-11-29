/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 */
/*
 * Lightbox plugin
 */
/*global jQuery: false, pe: false, wet_boew_lightbox: false*/
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn : {}
	};
	/* local reference */
	_pe.fn.lightbox = {
		type : 'plugin',
		depends : ['colorbox', 'metadata'],
		groupindex : 0,
		_exec : function (elm) {
			// Variables
			var opts,
				opts2 = {},
				overrides,
				$lb,
				$lbContent,
				$lbLoadedContent,
				$lbNext,
				$lbPrev,
				$lbClose,
				open = false;

			// Defaults
			opts = {
				transition : 'elastic',
				loop : true,
				current : pe.dic.get('%lb-current'),
				previous : pe.dic.get('%lb-prev'),
				next : pe.dic.get('%lb-next'),
				close : pe.dic.get('%close'),
				xhrError : pe.dic.get('%lb-xhr-error'),
				imgError : pe.dic.get('%lb-img-error'),
				maxWidth : '100%',
				maxHeight : '100%',
				slideshowStart : pe.dic.get('%start') + ' ' + pe.dic.get('%lb-slideshow'),
				slideshowStop : pe.dic.get('%stop') + ' ' + pe.dic.get('%lb-slideshow'),
				slideshow : false,
				slideshowAuto : false,
				onLoad : function () {
					var $lbTitle = $lbContent.find('#cboxTitle'),
						$lbCurrent = $lbTitle.next();
					$lbTitle.addClass('wb-hide');
					$lbCurrent.addClass('wb-hide');
				},
				onComplete : function () {
					var $lbTitle = $lbContent.find('#cboxTitle'),
						$lbCurrent = $lbTitle.next();

					$lbLoadedContent = $lbContent.find('#cboxLoadedContent').attr('tabindex', '0');
					$lbLoadedContent.attr('aria-label', $lbTitle.text() + ' ' + $lbCurrent.text());
					if ($lbLoadedContent.children('.cboxPhoto').length === 0) {
						$lbLoadedContent.attr('role', 'document');
					} else {
						$lbLoadedContent.children().attr('alt', $lbTitle.text());
					}
					$lbTitle.removeClass('wb-hide');
					$lbCurrent.removeClass('wb-hide');
					pe.focus($lbLoadedContent);
					open = true;
				},
				onClosed : function () {
					open = false;
				}
			};

			// Class-based overrides
			overrides = {
				transition : (elm.hasClass('transition-fade') ? 'fade' : (elm.hasClass('transition-none') ? 'none' : undefined)),
				loop : elm.hasClass('loop-none') ? false : undefined,
				slideshow : elm.hasClass('slideshow') ? true : undefined,
				slideshowAuto : elm.hasClass('slideshow-auto') ? true : undefined
			};

			// Extend the defaults with settings passed through settings.js (wet_boew_lightbox), class-based overrides and the data attribute
			$.metadata.setType('attr', 'data-wet-boew');
			if (typeof wet_boew_lightbox !== 'undefined' && wet_boew_lightbox !== null) {
				$.extend(opts, wet_boew_lightbox, overrides, elm.metadata());
			} else {
				$.extend(opts, overrides, elm.metadata());
			}

			// Add touchscreen support for launching the lightbox
			$lb = elm.find('.lb-item, .lb-gallery, .lb-hidden-gallery').on('vclick', function () {
				$.colorbox.launch(this);
			});

			// Create options object for inline content
			$.extend(opts2, opts, {inline: 'true'});

			// Build single images, inline content and AJAXed content
			$lb.filter('.lb-item').attr('aria-haspopup', 'true').each(function () {
				pe.fn.lightbox._init_colorbox(this, opts, opts2);
			});

			// Build galleries
			$lb.filter('.lb-gallery, .lb-hidden-gallery').each(function () {
				var group = {rel: 'group' + (pe.fn.lightbox.groupindex += 1)};
				$.extend(opts, group);
				$.extend(opts2, group);
				$(this).find('.lb-item-gal').attr('aria-haspopup', 'true').each(function () {
					pe.fn.lightbox._init_colorbox(this, opts, opts2);
				});
			});

			// Add WAI-ARIA
			$lbContent = $('#colorbox #cboxContent').attr('role', 'dialog');
			$lbContent.find('#cboxNext, #cboxPrevious, #cboxClose').attr({'tabindex': '0', 'role': 'button', 'aria-controls': 'cboxLoadedContent'});
			$lbNext = $lbContent.find('#cboxNext');
			$lbPrev = $lbContent.find('#cboxPrevious');
			$lbClose = $lbContent.find('#cboxClose');

			// Add extra keyboard support (handling for tab, enter and space)
			$lbContent.on('keydown', function (e) {
				var target_id = e.target.id;
				if (!(e.ctrlKey || e.altKey || e.metaKey)) {
					if (e.keyCode === 9) {
						if (e.shiftKey && target_id === 'cboxLoadedContent') {
							pe.focus($lbClose);
							e.preventDefault();
						} else if (!e.shiftKey && target_id === 'cboxClose') {
							pe.focus($lbLoadedContent);
							e.preventDefault();
						}
					} else if (e.keyCode === 13 || e.keyCode === 32) {
						if (target_id === 'cboxLoadedContent' || target_id === 'cboxNext') {
							$.colorbox.next();
							e.preventDefault();
						} else if (target_id === 'cboxPrevious') {
							$.colorbox.prev();
							e.preventDefault();
						} else if (target_id === 'cboxClose') {
							$.colorbox.close();
							e.preventDefault();
						}
					}
				}
			});
		}, // end of exec

		_init_colorbox : function(link, opts_default, opts_inline) {
			var opts = link.getAttribute('href').substring(0, 1) !== '#' ? opts_default : opts_inline,
				title = this._get_title(link);
			$(link).colorbox(title ? $.extend({}, opts, title) : opts);
		},

		_get_title : function(link) {
			var	title = document.getElementById(link.getAttribute('data-title'));
			return (title && title.innerHTML.length > 0) ? {title: title.innerHTML} : false;
		}
	};
	window.pe = _pe;
	return _pe;
}(jQuery));

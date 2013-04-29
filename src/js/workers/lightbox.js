/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt
 */
/*
 * Lightbox plugin
 */
/*global jQuery: false, wet_boew_lightbox: false*/
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn : {}
	};
	/* local reference */
	_pe.fn.lightbox = {
		type : 'plugin',
		depends : ['colorbox'],
		groupindex : 0,
		_exec : function (elm) {
			// Variables
			var opts,
				overrides,
				$lb,
				$lbContent,
				$lbLoadedContent,
				$lbNext,
				$lbPrev,
				$lbClose,
				open = false,
				slideshowText = ' ' + _pe.dic.get('%lb-slideshow');

			// Defaults
			opts = {
				transition : 'elastic',
				loop : true,
				current : _pe.dic.get('%lb-current'),
				previous : _pe.dic.get('%lb-prev'),
				next : _pe.dic.get('%lb-next'),
				close : _pe.dic.get('%close'),
				xhrError : _pe.dic.get('%lb-xhr-error'),
				imgError : _pe.dic.get('%lb-img-error'),
				maxWidth : '100%',
				maxHeight : '100%',
				slideshowStart : _pe.dic.get('%start') + slideshowText,
				slideshowStop : _pe.dic.get('%stop') + slideshowText,
				slideshow : false,
				slideshowAuto : false,
				onComplete : function () {
					var $lbTitle = $lbContent.find('#cboxTitle'),
						$lbCurrent = $lbContent.find('#cboxCurrent'),
						currentText = $lbCurrent.text(),
						$origImg,
						$currImg,
						describedBy,
						longdesc,
						alt_text = $lbTitle.text() + (currentText.length !== 0 ? ' - ' + currentText : '');
					
					$lbLoadedContent = $lbContent.find('#cboxLoadedContent').attr('tabindex', '0');
					$currImg = $lbLoadedContent.children('.cboxPhoto');
					$lbLoadedContent.attr('aria-label', alt_text);
					if ($currImg.length === 0) {
						$lbLoadedContent.attr('role', 'document');
					} else {
						$currImg.attr('alt', alt_text);
						$origImg = $.colorbox.element().find('img');

						// Bring over some of the original image attributes
						describedBy = $origImg.attr('aria-describedby');
						longdesc = $origImg.attr('longdesc');
						if (typeof describedBy !== 'undefined') {
							$lbLoadedContent.attr('aria-describedby', describedBy);
							$currImg.attr('aria-describedby', describedBy);
						}
						if (typeof longdesc !== 'undefined') {
							$currImg.attr('longdesc', longdesc);
						}
					}
					_pe.focus($lbLoadedContent);
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

			// Extend the defaults with settings passed through settings.js (wet_boew_lightbox), class-based overrides and the data-wet-boew attribute
			$.extend(opts, (typeof wet_boew_lightbox !== 'undefined' ? wet_boew_lightbox : {}), overrides, _pe.data.getData(elm, 'wet-boew'));

			// Find the lightbox links and galleries
			$lb = elm.find('.lb-item, .lb-item-gal, .lb-gallery, .lb-hidden-gallery');

			// Build single images, inline content and AJAXed content
			$lb.filter('.lb-item').attr('aria-haspopup', 'true').each(function () {
				_pe.fn.lightbox._init_colorbox(this, opts);
			});

			// Build galleries
			$lb.filter('.lb-gallery, .lb-hidden-gallery').each(function () {
				var group = 'group' + (_pe.fn.lightbox.groupindex += 1);
				$(this).find('.lb-item-gal').attr('aria-haspopup', 'true').each(function () {
					_pe.fn.lightbox._init_colorbox(this, opts, group);
				});
			});

			// Add WAI-ARIA
			$lbContent = $('#colorbox #cboxContent').attr('role', 'dialog');
			$lbContent.find('#cboxNext, #cboxPrevious, #cboxClose').attr({'tabindex': '0', 'role': 'button', 'aria-controls': 'cboxLoadedContent'});
			$lbNext = $lbContent.find('#cboxNext');
			$lbPrev = $lbContent.find('#cboxPrevious');
			$lbClose = $lbContent.find('#cboxClose');

			// Add swipe and extra keyboard support (handling for tab, enter and space)
			$lbContent.on('keydown swipeleft swiperight', function (e) {
				var target_id = e.target.id,
					type = e.type;
				if (type === 'keydown') {
					if (!(e.ctrlKey || e.altKey || e.metaKey)) {
						if (e.keyCode === 9) {
							if (e.shiftKey && target_id === 'cboxLoadedContent') {
								_pe.focus($lbClose);
								e.preventDefault();
							} else if (!e.shiftKey && target_id === 'cboxClose') {
								_pe.focus($lbContent.find('#cboxLoadedContent'));
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
				} else if (type === 'swipeleft') {
					$.colorbox.next();
					e.preventDefault();
				} else {
					$.colorbox.prev();
					e.preventDefault();
				}
			});
		}, // end of exec

		_init_colorbox : function(link, opts, group) {
			var $link = $(link),
				isInline = $link.attr('href').substring(0, 1) === '#',
				isGroup = (group !== undefined),
				groupRel = (isGroup ? group : false),
				title = this._get_title(link);
			$link.colorbox((isInline || isGroup || title) ? $.extend((title ? title : {}), opts, {inline: isInline, rel: groupRel}) : opts);
		},

		_get_title : function(link) {
			var	title = document.getElementById(link.getAttribute('data-title'));
			return (title && title.innerHTML.length > 0) ? {title: title.innerHTML} : false;
		}
	};
	window.pe = _pe;
	return _pe;
}(jQuery));

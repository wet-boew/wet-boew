/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-eng.html / wet-boew.github.io/wet-boew/Licence-fra.html
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
				$colorbox,
				lb,
				lbItems,
				lbItem,
				$lbContent,
				$lbTitle,
				$lbCurrent,
				$lbLoadedContent,
				$lbNext,
				$lbPrev,
				$lbClose,
				slideshowText = ' ' + _pe.dic.get('%lb-slideshow'),
				group,
				index,
				index2,
				len,
				len2,
				open = false;

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
					var currentText = $lbCurrent.text(),
						titleText = $lbTitle.text(),
						$origImg,
						$currImg,
						describedBy,
						longdesc;
					$lbLoadedContent = $lbContent.find('#cboxLoadedContent');
					$currImg = $lbLoadedContent.children('.cboxPhoto');
					$colorbox.attr('aria-label', (titleText + (currentText.length !== 0 ? ' - ' + currentText : '')));
					if ($currImg.length === 0) {
						$lbLoadedContent.attr({'tabindex': '0', 'role': 'document', 'aria-labelledby': 'cboxTitle'});
					} else {
						$currImg.attr({'alt': titleText, 'tabindex': '0'});
						$origImg = $.colorbox.element().find('img');

						// Bring over some of the original image attributes
						describedBy = $origImg.attr('aria-describedby');
						longdesc = $origImg.attr('longdesc');
						if (typeof describedBy !== 'undefined') {
							$currImg.attr('aria-describedby', describedBy);
						}
						if (typeof longdesc !== 'undefined') {
							$currImg.attr('longdesc', longdesc);
						}
					}
					_pe.focus($colorbox);
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
				slideshowAuto : elm.hasClass('slideshow-auto') ? true : undefined,
				photo : elm.hasClass('force-photo') ? true : false
			};

			// Extend the defaults with settings passed through settings.js (wet_boew_lightbox), class-based overrides and the data-wet-boew attribute
			$.extend(opts, (typeof wet_boew_lightbox !== 'undefined' ? wet_boew_lightbox : {}), overrides, _pe.data.getData(elm, 'wet-boew'));

			// Find the lightbox links and galleries
			lb = elm.find('.lb-item, .lb-gallery, .lb-hidden-gallery').get();
			for (index = 0, len = lb.length; index !== len; index += 1) {
				lbItem = lb[index];
				if (lbItem.className.indexOf('lb-item') !== -1) {
					// Build single images, inline content and AJAXed content
					_pe.fn.lightbox._init_colorbox(lbItem, opts);
				} else {
					// Build galleries
					group = 'group' + (_pe.fn.lightbox.groupindex += 1);
					lbItems = $(lbItem).find('.lb-item-gal').get();
					for (index2 = 0, len2 = lbItems.length; index2 !== len2; index2 += 1) {
						_pe.fn.lightbox._init_colorbox(lbItems[index2], opts, group);
					}
				}
			}

			// Add WAI-ARIA
			$colorbox = $('#colorbox').attr('tabindex', '0');
			$lbContent = $('#cboxContent');
			$lbTitle = $lbContent.find('#cboxTitle');
			$lbCurrent = $lbContent.find('#cboxCurrent');
			$lbNext = $lbContent.find('#cboxNext');
			$lbPrev = $lbContent.find('#cboxPrevious');
			$lbClose = $lbContent.find('#cboxClose');
			$lbNext.add($lbPrev).add($lbClose).attr({'tabindex': '0', 'role': 'button', 'aria-controls': 'cboxLoadedContent'});

			// Add swipe and extra keyboard support (handling for tab, enter and space)
			$colorbox.on('keydown swipeleft swiperight', function (e) {
				var target_id = e.target.id,
					type = e.type;
				if (type === 'keydown') {
					if (!(e.ctrlKey || e.altKey || e.metaKey)) {
						if (e.keyCode === 9) {
							if (e.shiftKey && target_id === 'colorbox') {
								_pe.focus($lbClose);
								e.preventDefault();
							} else if ((!e.shiftKey && target_id === 'cboxClose') || (e.shiftKey && target_id === 'cboxLoadedContent')) {
								_pe.focus($colorbox);
								e.preventDefault();
							}
						} else if (e.keyCode === 13 || e.keyCode === 32) {
							if (target_id === 'cboxLoadedContent' || target_id === 'colorbox' || target_id === 'cboxNext') {
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
				dataTitle = document.getElementById(link.getAttribute('data-title'));
			$link.colorbox((isInline || isGroup || dataTitle) ? $.extend(((dataTitle && dataTitle.innerHTML.length > 0) ? {title: dataTitle.innerHTML} : {}), opts, {inline: isInline, rel: groupRel}) : opts);
		}
	};
	window.pe = _pe;
	return _pe;
}(jQuery));

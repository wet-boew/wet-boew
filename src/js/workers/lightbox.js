/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt
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
		depends : ['colorbox'],
		groupindex : 0,
		_exec : function (elm) {
			// Variables
			var opts,
				overrides,
				lb,
				lbItems,
				lbItem,
				$lbContent,
				$lbLoadedContent,
				$lbNext,
				$lbPrev,
				$lbClose,
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
					pe.fn.lightbox._init_colorbox(lbItem, opts);
				} else {
					// Build galleries
					group = 'group' + (pe.fn.lightbox.groupindex += 1);
					lbItems = $(lbItem).find('.lb-item-gal').get();
					for (index2 = 0, len2 = lbItems.length; index2 !== len2; index2 += 1) {
						pe.fn.lightbox._init_colorbox(lbItems[index2], opts, group);
					}
				}
			}

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
							pe.focus($lbContent.find('#cboxLoadedContent'));
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

		_init_colorbox : function(link, opts, group) {
			var $link = $(link),
				isInline = $link.attr('href').substring(0, 1) === '#',
				isGroup = (group !== undefined),
				groupRel = (isGroup ? group : false),
				dataTitle = document.getElementById(link.getAttribute('data-title')),
				title = (dataTitle && dataTitle.innerHTML.length > 0) ? {dataTitle: dataTitle.innerHTML} : false;
			$link.colorbox((isInline || isGroup || title) ? $.extend((title ? title : {}), opts, {inline: isInline, rel: groupRel}) : opts);
		}
	};
	window.pe = _pe;
	return _pe;
}(jQuery));

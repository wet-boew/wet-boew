/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 */
/*
 * Slideout
 */
/*global jQuery: false, pe: false*/
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	};
	/* local reference */
	_pe.fn.slideout = {
		type: 'plugin',
		depends: ['metadata'],
		opened: false,
		_exec: function (elm) {
			var borderWidth = 10,
				tocText = pe.dic.get('%table-contents'),
				hideText = pe.dic.get('%hide'),
				closeLink = hideText + '<span class="wb-invisible">' + tocText + '</span>',
				focusOutlineAllowance = 2,
				opened = false,
				reposition,
				rmCurrLink = true,
				scroll = true,
				toggle,
				toggleLink,
				slideoutClose,
				ttlHeight = 0,
				wrapper,
				container,
				innerWrapper,
				keyhandler,
				tocLinks,
				documentToggle,
				opts,
				ie7 = pe.ie > 0 && pe.ie < 8,
				$wbcorein = $('#wb-core-in'),
				imagesDir = pe.add.liblocation + 'images/slideout/';

			opts = {
				imgShow: {
					src: imagesDir + pe.dic.get('%show-image'),
					height: 147,
					width: 30,
					alt: pe.dic.get('%show-toc') + tocText
				},
				imgHide: {
					src: imagesDir + pe.dic.get('%hide-image'),
					height: 147,
					width: 30,
					alt: hideText + tocText
				}
			};
			$.extend(opts, elm.metadata({type: 'attr', name: 'data-wet-boew'}));

			// Don't do anything if CSS is disabled
			if (!pe.cssenabled()) {
				return;
			}

			// Add the wrappers
			innerWrapper = elm.wrap('<div><div id="slideoutWrapper" role="application"><div id="slideoutInnerWrapper"></div></div></div>').parent(); // This is used for overflow: hidden and animate.
			wrapper = innerWrapper.parent();
			container = wrapper.parent();

			// Detach the tab content to reduce execution time
			wrapper.detach();

			// Add WAI-ARIA
			elm.attr({'role': 'menu', 'id': 'slideout-body'}).find('ul, li').attr('role', 'presentation');

			// Remove the link off the page we're on if we're asked to
			if (rmCurrLink) {
				elm.find('a[href="' + window.location.href + '"]').replaceWith('<span class="so-active">' + $(this).text() + '</span>');
			}

			// Find all the TOC links
			tocLinks = elm.find('a').attr('role', 'menuitem');

			// Recalculate the slideout's position
			reposition = function () {
				if (!opened) { // Only when slideout is closed
					var newPosition = $wbcorein.offset().left;

					if (newPosition <= borderWidth) {
						newPosition = 0;
					}

					// Vertical
					wrapper.css('top', $wbcorein.offset().top);
					// Horizontal
					wrapper.css('right', newPosition);
				}
			};

			toggle = function (e) {
				toggleLink.off('click vclick touchstart', toggle);
				tocLinks.off('click vclick touchstart', toggle);
				slideoutClose.off('click vclick touchstart', toggle);
				wrapper.off('keydown', keyhandler);
				elm.off('keydown', keyhandler);
				_pe.document.off('click vclick touchstart', documentToggle);

				if (!opened) {
					var position = wrapper.position();
					if (pe.ie <= 0 || document.documentMode !== undefined) {
						wrapper.removeClass('slideoutWrapper')
							.addClass('slideoutWrapperRel')
							.css({'top': position.top - $wbcorein.offset().top, 'right': borderWidth - 10});
					}
					// Give the tab time to move out of view to prevent overlap
					setTimeout(function () {
						elm.show();
					}, 50);
					pe.focus(tocLinks.eq(0));
				}

				opened = !opened;
				wrapper.animate({
					width: parseInt(wrapper.css('width'), 10) === (opts.imgShow.width + focusOutlineAllowance) ? elm.outerWidth() + (opts.imgShow.width + focusOutlineAllowance) : (opts.imgShow.width + focusOutlineAllowance) + 'px'
				}, function () {
					// Animation complete.
					if (!opened) {
						elm.hide(); // Hide the widget content if the widget was just closed
						wrapper.find('#slideoutInnerWrapper').css('width', opts.imgHide.width);

						if (pe.ie <= 0 || document.documentMode !== undefined) {
							wrapper.addClass('slideoutWrapper');
							wrapper.removeClass('slideoutWrapperRel');
							wrapper.css('width', (opts.imgShow.width + focusOutlineAllowance) + 'px').css('top', $wbcorein.offset().top);
							reposition();
						}
					} else { // Slideout just opened
						if (ie7 && document.documentMode === undefined) { // Just true IE7
							elm.find('ul').html(elm.find('ul').html()); // Ugly fix for #4312 (post #11)
						}
					}
					toggleLink.on('click vclick touchstart', toggle);
					tocLinks.on('click vclick touchstart', toggle);
					slideoutClose.on('click vclick touchstart', toggle);
					wrapper.on('keydown', keyhandler);
					elm.on('keydown', keyhandler);
					_pe.document.on('click vclick touchstart', documentToggle);
				});

				if (opened) {
					wrapper.find('#slideoutToggle a img').attr({'src': opts.imgHide.src,
						'title': opts.imgHide.alt,
						'alt': opts.imgHide.alt});
					wrapper.find('#slideoutToggle a');
					elm.attr('aria-hidden', 'false');
					wrapper.find('#slideoutInnerWrapper').css('width', '');
				} else {
					wrapper.find('#slideoutToggle a img').attr({'src': opts.imgShow.src,
						'title': opts.imgShow.alt,
						'alt': opts.imgShow.alt});
					wrapper.find('#slideoutToggle a');
					elm.attr('aria-hidden', 'true');
				}

				if (typeof e !== 'undefined' && $(e.target).is(slideoutClose)) {
					return false;
				}
			};

			// Handles specialized keyboard input
			keyhandler = function (e) {
				var target = $(e.target),
					menuitem = target.is('[role="menuitem"]'),
					tocLink,
					keychar,
					elmtext,
					match,
					matches;

				if (menuitem) {
					tocLinks.each(function (i) {
						if ($(this).is(target)) {
							tocLink = i;
							return false;
						}
					});
				}

				if (!(e.ctrlKey || e.altKey || e.metaKey)) {
					switch (e.keyCode) {
					case 9: // tab key
						if (opened && ((e.shiftKey && target.is(toggleLink)) || (!e.shiftKey && target.is(slideoutClose)))) {
							toggleLink.trigger('click');
							pe.focus(toggleLink);
							return false;
						}
						break;
					case 13: // enter key
						target.trigger('click');
						if (target.is(slideoutClose)) {
							pe.focus(toggleLink);
							return false;
						}
						break;
					case 27: // escape key
						if (opened) {
							toggle();
							pe.focus(toggleLink);
							return false;
						}
						break;
					case 32: // spacebar
						target.trigger('click');
						if (target.is(slideoutClose)) {
							pe.focus(toggleLink);
							return false;
						}
						break;
					case 38: // up arrow
						if (!menuitem) {
							if (opened) {
								pe.focus(tocLinks.eq(tocLinks.length - 1));
							} else {
								toggleLink.trigger('click');
							}
						} else {
							if (tocLink === 0) {
								pe.focus(tocLinks.eq(tocLinks.length - 1));
							} else {
								pe.focus(tocLinks.eq(tocLink - 1));
							}
						}
						return false;
					case 40: // down arrow
						if (!menuitem) {
							if (opened) {
								pe.focus(tocLinks.eq(0));
							} else {
								toggleLink.trigger('click');
							}
						} else {
							if (tocLink === tocLinks.length - 1) {
								pe.focus(tocLinks.eq(0));
							} else {
								pe.focus(tocLinks.eq(tocLink + 1));
							}
						}
						return false;
					default:
						// 0 - 9 and a - z keys
						if ((e.keyCode > 47 && e.keyCode < 58) || (e.keyCode > 64 && e.keyCode < 91)) {
							keychar = String.fromCharCode(e.keyCode).toLowerCase();
							elmtext = $(e.target).text();
							matches = elm.find('a').filter(function () {
								return ($(this).text().substring(0, 1).toLowerCase() === keychar || $(this).text() === elmtext);
							});

							if (matches.length > 0) {
								matches.each(function (index) {
									if ($(this).text() === elmtext) {
										match = index;
										return false;
									}
								});
								if (match < (matches.length - 1)) {
									pe.focus(matches.eq(match + 1));
									return false;
								}
								pe.focus(matches.eq(0));
							}
							return false;
						}
					}
				} else if (e.metaKey && e.keycode === 9) { // Shift + Tab
					if (target.is(toggleLink)) {
						toggleLink.trigger('click');
						return false;
					}
				}
			};

			// Close slideout after clicking on a link
			tocLinks.on('click vclick touchstart', toggle);
			wrapper.on('keydown', keyhandler);
			elm.on('keydown', keyhandler);

			// Close slideout if clicking outside of the slideout area
			documentToggle = function (e) {
				var $target = $(e.target);
				if (opened && !$target.is(elm) && !$target.is(wrapper) && $target.closest(elm).length === 0) {
					toggle();
				}
			};
			_pe.document.on('click vclick touchstart', documentToggle);

			// Add the 'Hide' link
			elm.append('<a href="#" id="slideoutClose" role="button" aria-controls="slideout-body">' + closeLink + '</a>');
			slideoutClose = elm.find('#slideoutClose');

			// Add the slideout toggle
			innerWrapper.css('padding', (focusOutlineAllowance / 2) + 'px').prepend('<div id="slideoutToggle" class="slideoutToggle"><a id="toggleLink" role="button" aria-controls="slideout-body" aria-label="' + opts.imgShow.alt + '" href="#" onclick="return false;"><img width="' + opts.imgShow.width + 'px' + '" height="' + opts.imgShow.height + 'px' + '" src="' + opts.imgShow.src + '" alt="' + opts.imgShow.alt + '" /></a></div>');
			toggleLink = innerWrapper.find('#toggleLink');
			wrapper.find('#slideoutToggle').css({'width' : opts.imgShow.width, 'height' : opts.imgShow.height}); // Resize the toggle to correct dimensions

			// Apply the CSS
			elm.addClass('tabbedSlideout');
			// Since we're hiding div#slideout, its height will be zero so we cache it now
			ttlHeight = elm.outerHeight();

			// Set vertical position and hide the slideout on load -- we don't want it to animate so we can't call slideout.toggle()
			wrapper.css('width', (opts.imgShow.width + focusOutlineAllowance) + 'px').css('top', $wbcorein.offset().top);

			// Hide widget content so we don't tab through the links when the slideout is closed
			elm.hide().attr('aria-hidden', 'true');
			innerWrapper.css('width', opts.imgHide.width);

			// IE6 and lower don't support position: fixed.
			// IE7's zoom messes up document dimensions (IE8 compat. view isn't affected)
			if (ie7 && document.documentMode === undefined) { // IE7 and lower (not including IE8 compat. view)
				scroll = false;
			}

			if (scroll) {
				wrapper.addClass('slideoutWrapper');
				// Handle window resize and zoom in/out events
				pe.resize(reposition);
				reposition();
			} else {
				wrapper.addClass('so-ie7');
				wrapper.addClass('slideoutWrapperRel').css({'right': borderWidth - 10, 'top': '0'});
			}

			// Toggle slideout
			toggleLink.on('click vclick touchstart', toggle);
			slideoutClose.on('click vclick touchstart', toggle);

			// Append the tab contents and remove the parent container
			container.append(wrapper);
			wrapper.unwrap();

			// Fix scrolling issue in some versions of IE (#4051)
			if (ie7) {
				_pe.html.css('overflowY', 'auto');
			}
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}
(jQuery));


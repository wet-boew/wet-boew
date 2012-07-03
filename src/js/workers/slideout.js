/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * Slideout
 */
/*global jQuery: false, pe: false*/
(function ($) {
	var _pe = window.pe || {fn: {} };
	/* local reference */
	_pe.fn.slideout = {
		type: 'plugin',
		depends: ['resize'],
		opened: false,
		_exec: function (elm) {
			var borderWidth = 10,
				closeLink = pe.dic.get('%hide') + '<span class="wb-invisible">' + pe.dic.get('%table-contents') + '</span>',
				focusOutlineAllowance = 2,
				imgShow = { path: pe.add.liblocation + 'images/slideout/' + pe.dic.get('%show-image'), height: 147, width: 30, alt: pe.dic.get('%show-toc') + pe.dic.get('%table-contents') },
				imgHide = { path: pe.add.liblocation + 'images/slideout/' + pe.dic.get('%hide-image'), height: 147, width: 30, alt: pe.dic.get('%hide') + pe.dic.get('%table-contents') },
				opened = false,
				reposition,
				rmCurrLink = true,
				scroll = true,
				toggle,
				toggleLink,
				slideoutClose,
				ttlHeight = 0,
				wrapper,
				keyhandler;

			// Add the wrappers
			wrapper = elm.wrap('<div id="slideoutWrapper" />').parent(); // This is used for overflow: hidden.
			elm.wrap('<div id="slideoutInnerWrapper" />'); // This is used for "animate".

			// Recalculate the slideout's position
			reposition = function () {
				if (!opened) { // Only when slideout is closed
					var newPosition = $('#wb-main-in').offset().left;

					if (newPosition <= borderWidth) {
						newPosition = 0;
					}

					// Vertical
					wrapper.css('top', $('#wb-main-in').offset().top);
					// Horizontal
					wrapper.css('right', newPosition);
				}
			};

			toggle = function (e) {
				toggleLink.off('click vclick');
				slideoutClose.off('click vclick');

				if (!opened) {
					var position = wrapper.position();
					if (pe.ie === 0 || document.documentMode !== undefined) {
						wrapper.removeClass('slideoutWrapper')
							.addClass('slideoutWrapperRel')
							.css({"top": position.top - $('#wb-main-in').offset().top, "right": borderWidth - 10});
					}
					elm.show(); // Show the widget content if it is about to be opened
				}

				opened = !opened;
				wrapper.animate({
					width: parseInt(wrapper.css('width'), 10) === (imgShow.width + focusOutlineAllowance) ? elm.outerWidth() + (imgShow.width + focusOutlineAllowance) : (imgShow.width + focusOutlineAllowance) + 'px'
				}, function () {
					// Animation complete.
					if (!opened) {
						elm.hide(); // Hide the widget content if the widget was just closed
						wrapper.find('#slideoutInnerWrapper').css('width', imgHide.width);

						if (pe.ie === 0 || document.documentMode !== undefined) {
							wrapper.addClass('slideoutWrapper');
							wrapper.removeClass('slideoutWrapperRel');
							wrapper.css('width', (imgShow.width + focusOutlineAllowance) + 'px').css('top', $('#wb-main-in').offset().top);
							reposition();
						}
					} else { // Slideout just opened
						if (pe.ie === 7 && document.documentMode === undefined) { // Just true IE7
							elm.find('ul').html(elm.find('ul').html()); // Ugly fix for #4312 (post #11)
						}
					}
					toggleLink.on('click vclick', toggle);
					slideoutClose.on('click vclick', toggle);
				});

				if (opened) {
					wrapper.find('#slideoutToggle a img').attr({'src': imgHide.path,
						'title': imgHide.alt,
						'alt': imgHide.alt});
					wrapper.find('#slideoutToggle a').attr('aria-pressed', 'true');
					elm.attr('aria-hidden', 'false');
					wrapper.find('#slideoutInnerWrapper').css('width', '');
				} else {
					wrapper.find('#slideoutToggle a img').attr({'src': imgShow.path,
						'title': imgShow.alt,
						'alt': imgShow.alt});
					wrapper.find('#slideoutToggle a').attr('aria-pressed', 'false');
					elm.attr('aria-hidden', 'true');
				}

				return false;
			};

			// Handles specialized keyboard input
			keyhandler = function (e) {
				var target = $(e.target);
				if (!(e.ctrlKey || e.altKey || e.metaKey)) {
					switch (e.keyCode) {
					case 13: // enter key
						target.trigger("click");
						if (target.is(slideoutClose)) {
							pe.focus(toggleLink);
						}
						return false;
					case 27: // escape key
						if (opened) {
							toggle();
							pe.focus(toggleLink);
							return false;
						}
						break;
					case 32: // spacebar
						target.trigger("click");
						if (target.is(slideoutClose)) {
							pe.focus(toggleLink);
						}
						return false;
					default:
						// 0 - 9 and a - z keys
						if ((e.keyCode > 47 && e.keyCode < 58) || (e.keyCode > 64 && e.keyCode < 91)) {
							var keychar = String.fromCharCode(e.keyCode).toLowerCase(),
								elmtext = $(e.target).text(),
								match,
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
				}
			};

			// Remove the link off the page we're on if we're asked to
			if (rmCurrLink) {
				elm.find('li a').each(function () {
					if ($(this).get()[0].href === window.location.href) {
						$(this).replaceWith('<span class="so-active">' + $(this).text() + '</span>');
					}
				});
			}

			// Close slideout after clicking on a link
			elm.find('li a').on('click vclick', function () { 
				toggle(elm);
			});

			wrapper.on("keydown", keyhandler);
			elm.on("keydown", keyhandler);

			// Close slideout if clicking outside of the slideout area
			elm.on("click touchstart", function (e) {
				return false;
			});
			$(document).on("click touchstart", function () {
				if (opened) {
					toggle();
				}
			});

			// Add the "Hide" link
			elm.append('<a href="#" id="slideoutClose">' + closeLink + '</a>');
			slideoutClose = elm.find('#slideoutClose');

			// Add the slideout toggle
			wrapper.find('#slideoutInnerWrapper').css('padding', (focusOutlineAllowance / 2) + 'px').prepend('<div id="slideoutToggle" class="slideoutToggle"><a id="toggleLink" role="button" aria-pressed="false" aria-controls="slideout" href="#" onclick="return false;"><img width="' + imgShow.width + 'px' + '" height="' + imgShow.height + 'px' + '" src="' + imgShow.path + '" alt="' + imgShow.alt + '" title="' + imgShow.alt + '" /></a></div>');
			toggleLink = wrapper.find('#toggleLink');
			wrapper.find('#slideoutToggle').css({'width' : imgShow.width, 'height' : imgShow.height}); // Resize the toggle to correct dimensions

			// Apply the CSS
			elm.addClass('tabbedSlideout');
			// Since we're hiding div#slideout, its height will be zero so we cache it now
			ttlHeight = elm.outerHeight();

			// Set vertical position and hide the slideout on load -- we don't want it to animate so we can't call slideout.toggle()
			wrapper.css('width', (imgShow.width + focusOutlineAllowance) + 'px').css('top', $('#wb-main-in').offset().top);

			// Hide widget content so we don't tab through the links when the slideout is closed
			elm.hide().attr('aria-hidden', 'true');
			wrapper.find('#slideoutInnerWrapper').css('width', imgHide.width);

			// IE6 and lower don't support position: fixed.
			// IE7's zoom messes up document dimensions (IE8 compat. view isn't affected)
			if (pe.ie > 0 && pe.ie < 8 && document.documentMode === undefined) { // IE7 and lower (not including IE8 compat. view)
				scroll = false;
			}

			if (scroll) {
				wrapper.addClass('slideoutWrapper');
				// Handle window resize and zoom in/out events
				pe.resize(reposition);
				reposition();
			} else {
				wrapper.addClass('so-ie6');
				wrapper.addClass('slideoutWrapperRel')
					.css({'right': borderWidth - 10, 'top': '0'});
			}

			// Toggle slideout
			toggleLink.on('click vclick', toggle);
			slideoutClose.on('click vclick', toggle);

			// Fix scrolling issue in some versions of IE (#4051)
			if (pe.ie === 7) { $('html').css('overflowY', 'auto'); }

		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}
(jQuery));
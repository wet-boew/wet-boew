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
		focusOutlineAllowance: 2,
		borderWidth: 10,
		opened: false,
		_exec: function (elm) {
			_pe.fn.slideout.imgShow = { path: pe.add.liblocation + 'images/slideout/' + pe.dic.get('%show-image'), height: 147, width: 30, alt: pe.dic.get('%show-toc') + pe.dic.get('%table-contents') };
			_pe.fn.slideout.imgHide = { path: pe.add.liblocation + 'images/slideout/' + pe.dic.get('%hide-image'), height: 147, width: 30, alt: pe.dic.get('%hide') + pe.dic.get('%table-contents') };

			var ttlHeight = 0,
				scroll = true,
				closeLink = pe.dic.get('%hide') + '<span class="cn-invisible">' + pe.dic.get('%table-contents') + '</span>',
				rmCurrLink = true;

			// Remove the link off the page we're on if we're asked to
			if (rmCurrLink) {
				elm.find('li a').each(function () {
					if ($(this).get()[0].href === window.location.href) {
						$(this).replaceWith('<span class="so-active">' + $(this).text() + '</span>');
					}
				});
			}

			// Close slideout after clicking on a link
			elm.find('li a').each(function () {
				$(this).on('click', function () { _pe.fn.slideout.toggle(elm); $($(this).attr('href')).attr("tabindex", -1).focus(); });
			});

			// Add the wrappers
			elm.wrap('<div id="slideoutWrapper" />'); // This is used for overflow: hidden.
			elm.wrap('<div id="slideoutInnerWrapper" />'); // This is used for "animate".

			// Add the "Hide" link
			elm.append('<a href="#" id="slideoutClose" onclick="$(\'#toggleLink\').focus(); return false;">' + closeLink + '</a>');

			// Add the slideout toggle
			$('#slideoutInnerWrapper').css('padding', (_pe.fn.slideout.focusOutlineAllowance / 2) + 'px').prepend('<div id="slideoutToggle" class="slideoutToggle"><a id="toggleLink" role="button" aria-pressed="false" aria-controls="slideout" href="#" onclick="return false;"><img width="' + _pe.fn.slideout.imgShow.width + 'px' + '" height="' + _pe.fn.slideout.imgShow.height + 'px' + '" src="' + _pe.fn.slideout.imgShow.path + '" alt="' + _pe.fn.slideout.imgShow.alt + '" title="' + _pe.fn.slideout.imgShow.alt + '" /></a></div>');
			$('#slideoutToggle').css({'width' : _pe.fn.slideout.imgShow.width, 'height' : _pe.fn.slideout.imgShow.height}); // Resize the toggle to correct dimensions

			// Apply the CSS
			elm.addClass('tabbedSlideout');
			// Since we're hiding div#slideout, its height will be zero so we cache it now
			ttlHeight = elm.outerHeight();

			// Set vertical position and hide the slideout on load -- we don't want it to animate so we can't call slideout.toggle()
			$('#slideoutWrapper').css('width', (_pe.fn.slideout.imgShow.width + _pe.fn.slideout.focusOutlineAllowance) + 'px').css('top', $('#wb-main-in').offset().top);

			// Hide widget content so we don't tab through the links when the slideout is closed
			elm.hide()
				.attr('aria-hidden', 'true');
			$('#slideoutInnerWrapper').css('width', _pe.fn.slideout.imgHide.width);

			// IE6 and lower don't support position: fixed.
			// IE7's zoom messes up document dimensions (IE8 compat. view isn't affected)
			if (jQuery.browser.msie && document.documentMode === undefined) { // IE7 and lower (not including IE8 compat. view)
				scroll = false;
			}

			if (scroll) {
				$('#slideoutWrapper').addClass('slideoutWrapper');
				// Handle window resize and zoom in/out events
				ResizeEvents.eventElement.bind('x-initial-sizes x-text-resize x-zoom-resize x-window-resize', function () {
					_pe.fn.slideout.reposition();
				});
				_pe.fn.slideout.reposition();
			} else {
				$('#slideoutWrapper').addClass('so-ie6');
				$('#slideoutWrapper').addClass('slideoutWrapperRel')
					.css({'right': _pe.fn.slideout.borderWidth - 10, 'top': '0'});
			}

			// Toggle slideout
			$('#toggleLink').on('click', _pe.fn.slideout.toggle);
			$('#slideoutClose').on('click', _pe.fn.slideout.toggle);

			// Fix scrolling issue in some versions of IE (#4051)
			if (jQuery.browser.msie && jQuery.browser.version === '7.0') { $('html').css('overflowY', 'auto'); }
		}, // end of exec
		// Recalculate the slideout's position
		reposition: function () {
			if (!_pe.fn.slideout.opened) { // Only when slideout is closed
				var newPosition = $('#wb-main-in').offset().left;

				if (newPosition <= _pe.fn.slideout.borderWidth) {
					newPosition = 0;
				}

				// Vertical
				$('#slideoutWrapper').css('top', $('#wb-main-in').offset().top);
				// Horizontal
				$('#slideoutWrapper').css('right', newPosition);
			}
		},

		toggle: function (e) {
			var elm = $('#slideoutInnerWrapper').children('.wet-boew-slideout');
			$('#toggleLink').off('click');
			$('#slideoutClose').off('click');

			if (!_pe.fn.slideout.opened) {
				var position = $('#slideoutWrapper').position();
				if (!jQuery.browser.msie || document.documentMode !== undefined) {
					$('#slideoutWrapper').removeClass('slideoutWrapper')
						.addClass('slideoutWrapperRel')
						.css({"top": position.top - $('#wb-main-in').offset().top, "right": _pe.fn.slideout.borderWidth - 10});
				}
				elm.show(); // Show the widget content if it is about to be opened
			}

			_pe.fn.slideout.opened = !_pe.fn.slideout.opened;
			$('#slideoutWrapper').animate({
				width: parseInt($('#slideoutWrapper').css('width'), 10) === (_pe.fn.slideout.imgShow.width + _pe.fn.slideout.focusOutlineAllowance) ? elm.outerWidth() + (_pe.fn.slideout.imgShow.width + _pe.fn.slideout.focusOutlineAllowance) : (_pe.fn.slideout.imgShow.width + _pe.fn.slideout.focusOutlineAllowance) + 'px'
			}, function () {
				// Animation complete.
				if (!_pe.fn.slideout.opened) {
					elm.hide(); // Hide the widget content if the widget was just closed
					$('#slideoutInnerWrapper').css('width', _pe.fn.slideout.imgHide.width);

					if (!jQuery.browser.msie || document.documentMode !== undefined) {
						$('#slideoutWrapper').addClass('slideoutWrapper');
						$('#slideoutWrapper').removeClass('slideoutWrapperRel');
						$('#slideoutWrapper').css('width', (_pe.fn.slideout.imgShow.width + _pe.fn.slideout.focusOutlineAllowance) + 'px').css('top', $('#wb-main-in').offset().top);
						_pe.fn.slideout.reposition();
					}
				} else { // Slideout just opened
					if (jQuery.browser.msie && jQuery.browser.version === '7.0' && document.documentMode === undefined) { // Just true IE7
						$('#slideout ul').html($('#slideout ul').html()); // Ugly fix for #4312 (post #11)
					}
				}
				$('#toggleLink').on('click', _pe.fn.slideout.toggle);
				$('#slideoutClose').on('click', _pe.fn.slideout.toggle);
			});

			if (_pe.fn.slideout.opened) {
				$('#slideoutToggle a img').attr({'src': _pe.fn.slideout.imgHide.path,
					'title': _pe.fn.slideout.imgHide.alt,
					'alt': _pe.fn.slideout.imgHide.alt});
				$('#slideoutToggle a').attr('aria-pressed', 'true');
				elm.attr('aria-hidden', 'false');
				$('#slideoutInnerWrapper').css('width', '');
			} else {
				$('#slideoutToggle a img').attr({'src': _pe.fn.slideout.imgShow.path,
					'title': _pe.fn.slideout.imgShow.alt,
					'alt': _pe.fn.slideout.imgShow.alt});
				$('#slideoutToggle a').attr('aria-pressed', 'false');
				elm.attr('aria-hidden', 'true');
			}
		}
	};
	window.pe = _pe;
	return _pe;
}(jQuery));
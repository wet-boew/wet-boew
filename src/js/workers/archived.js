/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 */
/*
 * Web archived top page banner
 */
/*global jQuery: false, pe: false*/
(function ($) {
	"use strict";
	var _pe = window.pe || {fn: {} };
	/* local reference */
	_pe.fn.archived = {
		type: 'plugin',
		_exec: function (elm) {
			if (pe.mobile) {
				return; // we do not want this on mobile devices
			}
			// create the toolbar
			var notice = $('<div class="archived" role="toolbar"><a class="archived-top-page" href="#archived" role="link">' + pe.dic.get('%archived-page') + '</a></div>'),
				$window = _pe.window,
				scrollTop = $window.scrollTop();
			// lets bind the scrolls
			$window.on('scroll', function () {
				if ($(this).scrollTop() > 10) {
					notice.fadeIn('normal').attr('aria-hidden', 'false');
				} else {
					notice.fadeOut('normal').attr('aria-hidden', 'true');
				}
			});

			// Ensure that the archived notice does not overlap a link that gains focus
			_pe.document.on('focusin', function (e) {
				var target = $(e.target);
				if (notice.attr('aria-hidden') === 'false' && (target.offset().top + target.outerHeight()) <= (notice.offset().top + notice.outerHeight())) {
					$window.scrollTop($window.scrollTop() - notice.outerHeight());
				}
			});

			// now test to ensure that we have this correctly placed
			if (scrollTop < 10 || scrollTop === 'undefined') {
				notice.attr('aria-hidden', 'true');
			} else {
				notice.fadeIn('normal').attr('aria-hidden', 'false');
			}
			// add to page
			pe.pagecontainer().append(notice);
			return elm;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));

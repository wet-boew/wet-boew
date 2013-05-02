/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt
 */
/*
 * Footnotes
 */
/*global jQuery: false*/
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	};
	/* local reference */
	_pe.fn.footnotes = {
		type: 'plugin',
		_exec: function (elm) {
			var _ctn = _pe.main.not('.wet-boew-footnotes'), //reference to the content area (which needs to be scanned for footnote references)
				footnote_dd = elm.find('dd').attr('tabindex', '-1');

			// Apply aria-labelledby and set initial event handlers for return to referrer links
			footnote_dd.each(function () {
				var $this = $(this),
					dtid = this.id + '-dt';
				$this.attr('aria-labelledby', dtid).prev().attr('id', dtid);
			});

			//remove "first/premier/etc"-style text from certain footnote return links (via the child spans that hold those bits of text)
			footnote_dd.find('p.footnote-return a').each(function () {
				var $this = $(this);
				$this.find('span span').remove();
				$this.off('click vclick').on('click vclick', function () {
					var referrer = _ctn.find($(this).attr('href')).find('a');
					if (_pe.mobile) {
						$.mobile.silentScroll(_pe.focus(referrer).offset().top);
					} else {
						_pe.focus(referrer);
					}
					return false;
				});
			});

			//listen for footnote reference links that get clicked
			_ctn.find('sup a.footnote-link').on('click vclick', function () {
				//captures certain information about the clicked link
				var _refLinkDest = elm.find($(this).attr('href'));

				_refLinkDest.find('p.footnote-return a').attr('href', '#' + this.parentNode.id).off('click vclick').on('click vclick', function () {
					var referrer = _ctn.find($(this).attr('href')).find('a');
					if (_pe.mobile) {
						$.mobile.silentScroll(_pe.focus(referrer).offset().top);
					} else {
						_pe.focus(referrer);
					}
					return false;
				});
				if (_pe.mobile) {
					$.mobile.silentScroll(_pe.focus(_refLinkDest).offset().top);
				} else {
					_pe.focus(_refLinkDest);
				}
				if (_pe.ie > 0 && _pe.ie < 8) {
					_refLinkDest.addClass('footnote-focus').one('blur', function () {
						$(this).removeClass('footnote-focus');
					});
				}
				return false;
			});
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery)); 

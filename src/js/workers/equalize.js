/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
/*
 * Equalize plugin
 */

(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn : {}
	};
	/* local reference */
	_pe.fn.equalize = {
		type : 'plugin',
		depends : (_pe.mobile ? [] : ['equalheights']),
		_exec : function (elm) {
			if (_pe.mobile) {
				return;
			}

			$('.equalize').children().css('min-height', '').parent().equalHeights(true);
			_pe.resize(function () {
				$('.equalize').children().css('min-height', '').parent().equalHeights(true);
			});

			return elm;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}
(jQuery));

/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 */
/*
 * Equalize plugin
 */
/*global jQuery: false, pe:false*/
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn : {}
	};
	/* local reference */
	_pe.fn.equalize = {
		type : 'plugin',
		depends : (pe.mobile ? [] : ['equalheights', 'resize']),
		_exec : function (elm) {
			if (pe.mobile) {
				return;
			}

			$('.equalize').children().css('min-height', '').parent().equalHeights(true);
			pe.resize(function () {
				$('.equalize').children().css('min-height', '').parent().equalHeights(true);
			});

			return elm;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}
(jQuery));

/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * Equalize plugin
 */
/*global jQuery: false, pe:false*/
(function ($) {
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
 /*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * Zebra stripping functionality for block level elements
 */
/*global jQuery: false*/
(function ($) {
	var _pe = window.pe || {
		fn : {}
	};
	/* local reference */
	_pe.fn.zebra = {
		type : 'plugin',
		_exec : function (elm) {
			var $trs,
				$lis,
				parity;
			if (elm.is('table')) {
				$trs = (elm.children('tr').add(elm.children('tbody').children('tr'))).filter(function () {
					return $(this).children('td').length > 0;
				});
				// note: even/odd's indices start at 0
				$trs.filter(':odd').addClass('table-even');
				$trs.filter(':even').addClass('table-odd');
				$trs.on('hover focusin focusout', function (e) {
					e.stopPropagation();
					$(this).toggleClass('table-hover');
				});
			} else {
				$lis = elm.children('li');
				parity = (elm.parents('li').length + 1) % 2;
				$lis.filter(':odd').addClass(parity === 0 ? 'list-odd' : 'list-even');
				$lis.filter(':even').addClass(parity === 1 ? 'list-odd' : 'list-even');
				$lis.on('mouseover mouseout focusin focusout', function (e) {
					e.stopPropagation();
					$(this).toggleClass('list-hover');
				});
			}
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));
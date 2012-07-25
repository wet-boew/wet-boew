/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * Web archived top page banner
 */
/*global jQuery: false, pe: false*/
(function ($) {
	var _pe = window.pe || {fn: {} };
	/* local reference */
	_pe.fn.langselect = {
		type: 'plugin',

		_exec: function (elm) {
			elm.on('click', function () {
				var url = window.location.toString();

				if ((url.search(/_f\.htm/) > -1) || (url.search(/-fra\./) > -1)) {
					url = url.replace(/_f\./, "_e.");
					url = url.replace(/-fra\./, "-eng.");
				} else {
					url = url.replace(/_e\./, "_f.");
					url = url.replace(/-eng\./, "-fra.");
				}
				if (url.search(/lang=eng/) > -1) {
					url = url.replace(/lang=eng/, "lang=fra");
				} else {
					url = url.replace(/lang=fra/, "lang=eng");
				}
				window.location = url;
				return false;
			});
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));
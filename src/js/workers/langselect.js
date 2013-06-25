/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-eng.html / wet-boew.github.io/wet-boew/Licence-fra.html
 */
/*
 * Web archived top page banner
 */
/*global jQuery: false*/
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {} 
	};
	/* local reference */
	_pe.fn.langselect = {
		type: 'plugin',
		_exec: function (elm) {
			elm.on('click', function () {
				var url = window.location.toString();

				if ((url.search(/_f\.htm/) > -1) || (url.search(/-fra\./) > -1)) {
					url = url.replace(/_f\./, "_e.").replace(/-fra\./, "-eng.");
				} else {
					url = url.replace(/_e\./, "_f.").replace(/-eng\./, "-fra.");
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

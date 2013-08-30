/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
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
			elm.on('click', function (e) {
				var url = window.location.toString(),
					button = e.button;
				if (typeof button === 'undefined' || button === _pe.leftMouseButton) { // Ignore middle/right mouse buttons
					if ((url.search(/_f\.htm/) > -1) || (url.search(/-fra\./) > -1) || (url.search(/-fra\./) > -1)) {
						url = url.replace(/_f\./, '_e.').replace(/-fra\./, '-eng.').replace(/-fr\./, '-en.');
					} else {
						url = url.replace(/_e\./, '_f.').replace(/-eng\./, '-fra.').replace(/-en\./, '-fr.');
					}
					if (url.search(/lang=eng/) > -1) {
						url = url.replace(/lang=eng/, 'lang=fra');
					else if (url.search(/lang=fra/) > -1) {
						url = url.replace(/lang=fra/, 'lang=eng');
					else if (url.search(/lang=en/) > -1) {
						url = url.replace(/lang=en/, 'lang=fr');
					} else {
						url = url.replace(/lang=fr/, 'lang=en');
					}
					window.location = url;
					return false;
				}
			});
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));

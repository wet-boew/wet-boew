/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 */
/*
 * Date Modified Plug-in
 */
/*global jQuery: false, pe: false, wet_boew_datemodified: false*/
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	};
	/* local reference */
	_pe.fn.datemodified = {
		type: 'plugin',
		_exec: function (elm) {
			var opts,
				overrides,
				timeholder =  $('#gcwu-date-mod dd span time'),
				modifiedMeta = document.getElementsByName('dcterms.modified')[0];

			// Defaults
			opts = {
				// Should the Date Modified value be overwritten
				updateNonEmpty : false
			};

			if (typeof wet_boew_datemodified !== 'undefined' && wet_boew_datemodified !== null) {
				$.extend(opts, wet_boew_datemodified);
			} else {
				$.extend(opts);
			}
			
			if ( timeholder.text() === '' ||  opts.updateNonEmpty){
				timeholder.text(modifiedMeta.content);
			}
			
			return false;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}(jQuery));

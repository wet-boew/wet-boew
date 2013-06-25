/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-eng.html / wet-boew.github.io/wet-boew/Licence-fra.html
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
				timeholder,
				modifiedMeta = document.getElementsByName('dcterms.modified')[0];

			//escape early if meta tag is missing
			if (typeof modifiedMeta === 'undefined' || modifiedMeta === null) {
				return false;
			}
			
			opts = {
				updateNonEmpty : false,// Should the Date Modified value be overwritten even if there is a value already
				modifiedId: 'gcwu-date-mod' //What is the container ID of the data modified section
			};
			
			if (typeof wet_boew_datemodified !== 'undefined') {
				$.extend(opts, wet_boew_datemodified);
			}
			
			//
			timeholder =  document.getElementById(opts.modifiedId);
			if (typeof timeholder === 'undefined' || timeholder === null) {
				return false; //No Date modified section at all, like the splash pages
			} 
			
			timeholder = timeholder.getElementsByTagName('time')[0];
			if (typeof timeholder === 'undefined' || timeholder === null) {
				return false; //Date modified section is being used for a version string as per section 2.2.6.2  of the Standard on Web Usability
			} 
			
			if ( timeholder.innerHTML === '' ||  opts.updateNonEmpty){
				timeholder.innerHTML = modifiedMeta.content;
			}
			return false;
		} 
	};
	window.pe = _pe;
	return _pe;
}(jQuery));

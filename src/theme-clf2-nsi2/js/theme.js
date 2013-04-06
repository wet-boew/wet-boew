/*!
 *
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt
 *
 * Version: @wet-boew-build.version@
 *
 */
/*
 * CLF 2.0 theme scripting
 */
/*global jQuery: false, pe: false*/
(function ($) {
	"use strict";
	var wet_boew_theme, _wet_boew_theme;
	/**
	* wet_boew_theme object
	* @namespace wet_boew_theme
	*/
	wet_boew_theme = (typeof window.wet_boew_theme !== "undefined" && window.wet_boew_theme !== null) ? window.wet_boew_theme : {
		fn: {}
	};
	_wet_boew_theme = {
		theme: 'theme-clf2-nsi2',
		psnb: null,
		search: null,
		bcrumb: null,
		wmms: $('#cn-wmms'),
		init: function () {
			wet_boew_theme.psnb = pe.header.find('#cn-psnb');
			wet_boew_theme.bcrumb = pe.header.find('#cn-bc');
			
			// Add nav-current
			if (wet_boew_theme.psnb.length > 0) {
				pe.menu.navcurrent(wet_boew_theme.psnb, wet_boew_theme.bcrumb);
			}
			if (pe.secnav.length > 0) {
				pe.menu.navcurrent(pe.secnav, wet_boew_theme.bcrumb);
			}
		}
	};
	/* window binding */
	window.wet_boew_theme = $.extend(true, wet_boew_theme, _wet_boew_theme);
	return window.wet_boew_theme;
}
(jQuery));

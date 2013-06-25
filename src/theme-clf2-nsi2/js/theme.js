/*!
 *
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-eng.html / wet-boew.github.io/wet-boew/Licence-fra.html
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
		},

		/* Special handling for the desktop view */
		desktopview: function () {
			pe.document.one('wb-init-loaded', function(){
				if($('#wb-body-sec-sup').length && !pe.main.hasClass('wet-boew-equalize')) {
					pe.wb_load({'plugins': {'equalize': pe.main}});
				}
			});
			pe.document.trigger('themeviewloaded');
		}
	};
	/* window binding */
	window.wet_boew_theme = $.extend(true, wet_boew_theme, _wet_boew_theme);
	return window.wet_boew_theme;
}
(jQuery));

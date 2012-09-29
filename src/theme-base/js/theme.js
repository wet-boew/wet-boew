/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 */
/*
 * GC Web Usability Intranet theme scripting
 */
/*global jQuery: false, pe: false, window: false, document: false*/
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
		theme: 'theme-base',
		init: function () {
			wet_boew_theme.bcrumb = pe.header.find('#base-bc');

			// If there is a secondary menu, attempt to find the active section
			if (pe.secnav.length > 0) {
				pe.menu.navcurrent(pe.secnav, wet_boew_theme.bcrumb);
			}
		},
		mobileview: function () {
			var mb_dialogue,
				mb_header,
				mb_header_html,
				mb_btn_txt = pe.dic.get('%menu'),
				secnav_h2,
				nav,
				_list = "",
				navbar;

			// If there is a secondary menu, generate a mobile menu
			if (pe.secnav.length > 0) {
				mb_dialogue = '<div data-role="page" id="jqm-wb-mb"><div data-role="header">';
				secnav_h2 = pe.secnav.find('h2').eq(0);
				mb_header = secnav_h2;
				mb_header_html = mb_header[0].innerHTML;
				mb_dialogue += '<h1>' + mb_btn_txt + '</h1></div><div data-role="content" data-inset="true"><nav role="navigation">';

				// If there is a breadcrumb
				if (wet_boew_theme.bcrumb.length > 0) {
					mb_dialogue += '<section><div id="jqm-mb-location-text">' + wet_boew_theme.bcrumb[0].innerHTML + '</div></section>';
					wet_boew_theme.bcrumb.remove();
				} else {
					mb_dialogue += '<div id="jqm-mb-location-text"></div>';
				}

				nav = pe.menu.buildmobile(pe.secnav.find('.wb-sec-def'), 3, 'c', false, true);
				pe.menu.expandcollapsemobile(nav, (pe.secnav.find('h3.top-section').length > 0 ? 'h4' : 'h3'), true, false);
				pe.menu.expandcollapsemobile(nav, '.nav-current', false, true);
				mb_dialogue += '<section><div><h2>' + secnav_h2[0].innerHTML + '</h2><div data-role="controlgroup">' + nav[0].innerHTML + '</div></div></section>';
				pe.secnav.remove();

				mb_dialogue += '</nav></div></div></div>';
				pe.pagecontainer().append(mb_dialogue);
				mb_header.wrapInner('<a href="#jqm-wb-mb" data-rel="dialog"></a>');
				navbar = $('<div data-role="navbar" data-iconpos="right"><ul class="wb-hide"><li><a data-rel="dialog" data-theme="a" data-icon="site-menu" href="#jqm-wb-mb">' + mb_btn_txt + '</a></li></ul></div>');
				pe.header.append(navbar);
			}

			// jquery mobile has loaded
			$(document).on("pagecreate", function () {			
				//Transition to show loading icon on transition
				function loadingTransition(name, reverse, $to, $from) {
					var r;

					$.mobile.showPageLoadingMsg();
					r = $.mobile.transitionHandlers.simultaneous('pop', reverse, $to, $from);
					r.done(function(){$.mobile.hidePageLoadingMsg();});
					return r;
				}
				$.mobile.transitionHandlers.loadingTransition = loadingTransition;
				$.mobile.defaultDialogTransition = "loadingTransition";
			});
			// preprocessing before mobile page is enhanced
			$(document).on('pageinit', function () {
			});
			$(document).trigger('mobileviewloaded');
			return;
		}
	};
	/* window binding */
	window.wet_boew_theme = $.extend(true, wet_boew_theme, _wet_boew_theme);
	return window.wet_boew_theme;
}
(jQuery));

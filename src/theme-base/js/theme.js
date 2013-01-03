/*!
 *
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 *
 * Version: @wet-boew-build.version@
 *
 */
/*
 * Base theme scripting
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
		psnb: null,
		search: null,
		bcrumb: null,
		title: null,
		sft: null,
		fullft: null,
		menu: null,
		init: function () {
			wet_boew_theme.fullhd = pe.header.find('#base-fullhd');
			wet_boew_theme.psnb = pe.header.find('#base-psnb');
			wet_boew_theme.menubar = wet_boew_theme.psnb.find('.wet-boew-menubar');
			wet_boew_theme.search = pe.header.find('#base-srchbx');
			wet_boew_theme.bcrumb = pe.header.find('#base-bc');
			wet_boew_theme.title = pe.header.find('#base-title');
			wet_boew_theme.sft = pe.footer.find('#base-sft');
			wet_boew_theme.fullft = pe.footer.find('#base-fullft');

			var current = pe.menu.navcurrent(wet_boew_theme.menubar, wet_boew_theme.bcrumb),
				submenu = current.parents('div.mb-sm');

			// If the link with class="nav-current" is in the submenu, then move the class up to the associated menu bar link
			if (submenu.length !== 0) {
				submenu.prev().children('a').addClass('nav-current');
			}
			if (pe.secnav.length !== 0) {
				pe.menu.navcurrent(pe.secnav, wet_boew_theme.bcrumb);
			}

			// If no search is provided, then make the site menu link 100% wide
			if (wet_boew_theme.psnb.length !== 0 && wet_boew_theme.search.length === 0) {
				wet_boew_theme.psnb.addClass('mobile-change');
			} else if (wet_boew_theme.psnb.length === 0 && wet_boew_theme.search.length !== 0) {
				wet_boew_theme.search.addClass('mobile-change');
			}
		},
		mobileview: function () {
			var mb_popup,
				mb_header_html,
				mb_menu = '',
				mb_btn_txt = pe.dic.get('%menu'),
				srch_btn_txt = pe.dic.get('%search'),
				secnav_h2,
				s_popup,
				bodyAppend = '',
				popup_role = 'data-role="popup" data-overlay-theme="a"',
				popup_close = '<a href="#" data-rel="back" data-role="button" data-theme="a" data-icon="delete" data-iconpos="notext" class="ui-btn-' + ((pe.rtl) ? 'right' : 'left') + '">' + pe.dic.get('%close') + '</a>',
				_list = '',
				navbar,
				links,
				link,
				footer1,
				lang_links,
				lang_nav,
				mb_li,
				target,
				i,
				len,
				node;

			if (wet_boew_theme.menubar.length !== 0 || pe.secnav.length !== 0 || wet_boew_theme.search.length !== 0) {
				// Transform the menu to a popup
				mb_li = wet_boew_theme.menubar.find('ul.mb-menu li');
				mb_popup = '<div ' + popup_role + ' id="jqm-wb-mb"><div data-role="header">';
				secnav_h2 = (pe.secnav.length !== 0 ? pe.secnav[0].getElementsByTagName('h2')[0] : '');
				mb_header_html = (wet_boew_theme.menubar.length !== 0 ? wet_boew_theme.psnb.children(':header')[0] : (pe.secnav.length !== 0 ? secnav_h2 : wet_boew_theme.bcrumb.children(':header')[0])).innerHTML;
				mb_popup += '<h1>' + mb_btn_txt + '</h1>' + popup_close + '</div><div data-role="content" data-inset="true"><nav role="navigation">';

				if (wet_boew_theme.bcrumb.length !== 0) {
					node = wet_boew_theme.bcrumb[0];
					mb_popup += '<section><div id="jqm-mb-location-text">' + node.innerHTML + '</div></section>';
					node.parentNode.removeChild(node);
				} else {
					mb_popup += '<div id="jqm-mb-location-text"></div>';
				}

				// Build the menu
				if (pe.secnav.length !== 0) {
					mb_menu += '<section><div><h2>' + secnav_h2.innerHTML + '</h2><div data-role="controlgroup">' + pe.menu.buildmobile(pe.secnav.find('.wb-sec-def'), 3, 'b', false, true, 'c', true, true) + '</div></div></section>';
					node = pe.secnav[0];
					node.parentNode.removeChild(node);
				}
				if (wet_boew_theme.menubar.length !== 0) {
					mb_menu += '<section><div><h2>' + mb_header_html + '</h2><div data-role="controlgroup">' + pe.menu.buildmobile(mb_li, 3, 'a', true, true, 'c', true, true) + '</div></div></section>';
				}
				
				// Append the popup/dialog container and store the menu for appending later
				mb_popup += '<div id="jqm-mb-menu"></div></nav></div></div></div>';
				bodyAppend += mb_popup;
				wet_boew_theme.menu = mb_menu;
				_list += '<li><a data-rel="popup" data-theme="a" data-icon="site-menu" href="#jqm-wb-mb">' + mb_btn_txt + '</a></li>';
			}
			if (wet_boew_theme.search.length !== 0) {
				// :: Search box transform lets transform the search box to a popup
				s_popup = '<div ' + popup_role + ' id="jqm-wb-search"><div data-role="header"><h1>' + srch_btn_txt + '</h1>' + popup_close + '</div><div data-role="content"><div>' + wet_boew_theme.search[0].getElementsByTagName('form')[0].innerHTML + '</div></div></div>';
				bodyAppend += s_popup;
				_list += '<li><a data-rel="popup" data-theme="a" data-icon="search" href="#jqm-wb-search">' + srch_btn_txt + '</a></li>';
			}
			pe.bodydiv.append(bodyAppend);
			if (_list.length !== 0) {
				navbar = $('<div data-role="navbar" data-iconpos="' + ((pe.rtl) ? 'left' : 'right') + '"><ul class="wb-hide">' + _list + '</ul></div>');
				wet_boew_theme.title.after(navbar);
			}

			if (wet_boew_theme.sft.length !== 0) {
				links = wet_boew_theme.sft.find('.base-col-head a').get();
				target = document.getElementById('base-sft-in');
				if (wet_boew_theme.fullft.length !== 0) {
					node = wet_boew_theme.fullft[0];
					node.parentNode.removeChild(node);
				}
				// transform the footer into mobile nav bar
				footer1 = '<ul class="ui-grid-a">';
				for (i = 0, len = links.length; i < len; i += 1) {
					link = links[i];
					footer1 += '<li class="ui-block-' + (i % 2 !== 0 ? 'b' : 'a') + '"><a href="' + link.href + '" data-role="button" data-theme="c" data-corners="false">' + link.innerHTML + '</a></li>';
				}
				footer1 += '</ul>';
				target.id = '';
				target.className = '';
				target.setAttribute('data-role', 'footer');
				target.innerHTML = footer1;
			}

			// jQuery mobile has loaded
			$(document).on('pagecreate', function () {
				if (wet_boew_theme.menubar.length !== 0) {
					node = wet_boew_theme.psnb[0];
					node.parentNode.removeChild(node);
				}
				if (wet_boew_theme.search.length !== 0) {
					node = wet_boew_theme.search[0];
					node.parentNode.removeChild(node);
				}
				if (_list.length !== 0) {
					navbar.children().removeClass('wb-hide');

					// Defer appending of menu until after page is enhanced by jQuery Mobile, and
					// defer enhancing of menu until it is opened the first time (all to reduce initial page load time)
					var menu = pe.bodydiv.find('#jqm-mb-menu');
					if (menu.length !== 0) {
						menu.append(wet_boew_theme.menu);
						navbar.find('a[href="#jqm-wb-mb"]').one('click vclick', function () {
							menu.trigger('create');
							pe.menu.correctmobile(menu);
						});
					}
				}

				//Transition to show loading icon on transition
				function loadingTransition(name, reverse, $to, $from) {
					var r;

					$.mobile.showPageLoadingMsg();
					r = $.mobile.transitionHandlers.simultaneous('pop', reverse, $to, $from);
					r.done(function(){$.mobile.hidePageLoadingMsg();});
					return r;
				}
				$.mobile.transitionHandlers.loadingTransition = loadingTransition;
				$.mobile.defaultDialogTransition = 'loadingTransition';
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
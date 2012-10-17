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
		theme: 'theme-gcwu-intranet',
		psnb: null,
		search: null,
		bcrumb: null,
		title: null,
		sft: null,
		gcft: null,
		wmms: $('#gcwu-wmms'),
		menu: null,
		init: function () {
			wet_boew_theme.psnb = pe.header.find('#gcwu-psnb');
			wet_boew_theme.menubar = wet_boew_theme.psnb.find('.wet-boew-menubar');
			wet_boew_theme.search = pe.header.find('#gcwu-srchbx');
			wet_boew_theme.bcrumb = pe.header.find('#gcwu-bc');
			wet_boew_theme.title = pe.header.find('#gcwu-title');
			wet_boew_theme.sft = pe.footer.find('#gcwu-sft');
			wet_boew_theme.gcft = pe.footer.find('#gcwu-gcft');

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
				wet_boew_theme.psnb.css('width', '100%');
			} else if (wet_boew_theme.psnb.length === 0 && wet_boew_theme.search.length !== 0) {
				wet_boew_theme.search.css('width', '100%');
			}
		},
		mobileview: function () {
			var mb_popup,
				mb_header,
				mb_header_html,
				mb_menu = '',
				mb_btn_txt = pe.dic.get('%menu'),
				srch_btn_txt = pe.dic.get('%search'),
				srch_head,
				secnav_h2,
				nav,
				s_popup,
				popup_role = 'data-role="popup" data-overlay-theme="a"',
				popup_close = '<a href="#" data-rel="back" data-role="button" data-theme="a" data-icon="delete" data-iconpos="notext" class="ui-btn-left">' + pe.dic.get('%close') + '</a>',
				_list = '',
				navbar,
				links,
				footer1,
				lang_links,
				lang_nav,
				mb_li,
				target;

			if (wet_boew_theme.menubar.length !== 0 || pe.secnav.length !== 0 || wet_boew_theme.search.length !== 0) {
				// Transform the menu to a popup
				mb_li = wet_boew_theme.menubar.find('ul.mb-menu li');
				mb_popup = '<div ' + popup_role + ' id="jqm-wb-mb"><div data-role="header">';
				secnav_h2 = (pe.secnav.length !== 0 ? pe.secnav.find('h2').eq(0) : '');
				mb_header = (wet_boew_theme.menubar.length !== 0 ? wet_boew_theme.psnb.children(':header') : (pe.secnav.length !== 0 ? secnav_h2 : wet_boew_theme.bcrumb.children(':header')));
				mb_header_html = mb_header[0].innerHTML;
				mb_popup += '<h1>' + mb_btn_txt + '</h1>' + popup_close + '</div><div data-role="content" data-inset="true"><nav role="navigation">';

				if (wet_boew_theme.bcrumb.length !== 0) {
					mb_popup += '<section><div id="jqm-mb-location-text">' + wet_boew_theme.bcrumb[0].innerHTML + '</div></section>';
					wet_boew_theme.bcrumb.remove();
				} else {
					mb_popup += '<div id="jqm-mb-location-text"></div>';
				}

				// Build the menu
				if (pe.secnav.length !== 0) {
					nav = pe.menu.buildmobile(pe.secnav.find('.wb-sec-def'), 3, 'b', false, true, 'c', true);
					pe.menu.expandcollapsemobile(nav, (pe.secnav.find('h3.top-section').length !== 0 ? 'h4' : 'h3'), true, false);
					pe.menu.expandcollapsemobile(nav, '.nav-current', false, true);
					mb_menu += '<section><div><h2>' + secnav_h2[0].innerHTML + '</h2><div data-role="controlgroup">' + nav[0].innerHTML + '</div></div></section>';
					pe.secnav.remove();
				}
				if (wet_boew_theme.menubar.length !== 0) {
					nav = pe.menu.buildmobile(mb_li, 3, 'a', true, true, 'c', true);
					mb_menu += '<section><div><h2>' + mb_header_html + '</h2><div data-role="controlgroup">' + nav[0].innerHTML + '</div></div></section>';
				}
				
				// Append the popup/dialog container and store the menu for appending later
				mb_popup += '<div id="jqm-mb-menu"></div></nav></div></div></div>';
				pe.bodydiv.append(mb_popup);
				wet_boew_theme.menu = mb_menu;

				mb_header.wrapInner('<a href="#jqm-wb-mb" data-rel="popup"></a>');
				_list += '<li><a data-rel="popup" data-theme="a" data-icon="site-menu" href="#jqm-wb-mb">' + mb_btn_txt + '</a></li>';
			}
			if (wet_boew_theme.search.length !== 0) {
				// :: Search box transform lets transform the search box to a popup
				srch_head = wet_boew_theme.search.find(':header');
				s_popup = '<div ' + popup_role + ' id="jqm-wb-search"><div data-role="header"><h1>' + srch_btn_txt + '</h1>' + popup_close + '</div><div data-role="content">' + ($('<div/>').append(wet_boew_theme.search.find('form')))[0].innerHTML + '</div></div>';
				pe.bodydiv.append(s_popup);
				srch_head.wrapInner('<a href="#jqm-wb-search" data-rel="popup"></a>');
				_list += '<li><a data-rel="popup" data-theme="a" data-icon="search" href="#jqm-wb-search">' + srch_btn_txt + '</a></li>';
			}
			if (_list.length !== 0) {
				navbar = $('<div data-role="navbar" data-iconpos="right"><ul class="wb-hide">' + _list + '</ul></div>');
				wet_boew_theme.title.after(navbar);
			}

			lang_links = $('#gcwu-lang');
			if (lang_links.length !== 0) {
				links = lang_links.find('a');
				lang_nav = '<div data-role="navbar"><ul>';
				links.each(function () {
					lang_nav += '<li><a href="' + this.href + '" data-theme="a">' + this.innerHTML + '</a></li>';
				});
				lang_nav += '</ul></div>';
				lang_links.find('#gcwu-ef-lang').replaceWith(lang_nav);
				lang_links.find('#gcwu-other-lang').remove();
			}
			if (wet_boew_theme.sft.length !== 0) {
				links = wet_boew_theme.sft.find('#gcwu-tctr a, .gcwu-col-head a');
				target = wet_boew_theme.sft.children('#gcwu-sft-in');
				wet_boew_theme.gcft.parent().remove();
			} else {
				target = pe.footer.find('#gcwu-tc');
				if (target.length !== 0) {
					links = target.find('a');
				}
			}
			if (target.length !== 0) {
				// transform the footer into mobile nav bar
				footer1 = '<div data-role="navbar"><ul>';
				links.each(function () {
					footer1 += '<li><a href="' + this.href + '" data-theme="c">' + this.innerHTML + '</a></li>';
				});
				footer1 += '</ul></div>';
				target.replaceWith(footer1);
			}
			pe.footer.find('footer').append(wet_boew_theme.wmms.detach());

			// jquery mobile has loaded
			$(document).on("pagecreate", function () {
				if (wet_boew_theme.menubar.length !== 0) {
					wet_boew_theme.psnb.parent().remove();
				}
				if (wet_boew_theme.search.length !== 0) {
					wet_boew_theme.search.parent().remove();
				}
				if (_list.length !== 0) {
					navbar.children().removeClass('wb-hide');
				}

				// Delay appending of menu by 1 millisecond to avoid JavaScript execution timeout issues
				var menu = pe.bodydiv.find('#jqm-mb-menu');
				setTimeout(function() {
					menu.append(wet_boew_theme.menu).trigger('create');
					pe.menu.correctmobile(menu);
				},1);
				
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
			$(document).trigger('mobileviewloaded');
			return;
		}
	};
	/* window binding */
	window.wet_boew_theme = $.extend(true, wet_boew_theme, _wet_boew_theme);
	return window.wet_boew_theme;
}
(jQuery));
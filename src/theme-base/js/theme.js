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
				current = pe.menu.navcurrent(pe.secnav, wet_boew_theme.bcrumb);
				submenu = current.parents('ul');
				submenu.prev().children('a').addClass('nav-current');
			}

			// If no search is provided, then make the site menu link 100% wide
			if (wet_boew_theme.psnb.length !== 0 && wet_boew_theme.search.length === 0) {
				wet_boew_theme.psnb.addClass('mobile-change');
			} else if (wet_boew_theme.psnb.length === 0 && wet_boew_theme.search.length !== 0) {
				wet_boew_theme.search.addClass('mobile-change');
			}
		},

		/* Special handling for the mobile view */
		mobileview: function () {
			var mb_popup,
				mb_header_html,
				mb_menu = '',
				mb_btn_txt,
				srch_btn_txt,
				settings_txt = pe.dic.get('%settings'),
				settings_popup,
				secnav_h2,
				s_form,
				s_form_html,
				s_popup,
				bodyAppend = '',
				button = '<a data-role="button" data-iconpos="notext"',
				popup_link = ' data-rel="popup" data-position-to="window"',
				popup_button = button + popup_link,
				popup = '<div data-role="popup" data-overlay-theme="a"',
				popup_header_open = '<div data-role="header"',
				popup_default_header_open = popup_header_open + '><h1>',
				popup_settings = ' data-theme="c" class="ui-corner-all">',
				popup_settings_header_open = popup_header_open + ' class="ui-corner-top"><h1>',
				popup_settings_content_open = '<div data-role="content" data-theme="c" class="ui-corner-bottom ui-content">',
				popup_close_btn = button + ' href="javascript:;" data-icon="delete" data-rel="back" class="ui-btn-right">' + pe.dic.get('%close') + '</a>',
				popup_back_btn_open = popup_button + ' data-icon="back" class="ui-btn-left"',
				popup_back_btn_close = '>' + pe.dic.get('%back') + '</a>',
				popup_close = '</div></div>',
				listView = '<ul data-role="listview"',
				_list = '',
				links,
				link,
				lang_links,
				mb_li,
				target,
				i,
				len,
				nodes,
				node,
				home_href,
				header;

			// Content pages only
			if (wet_boew_theme.sft.length !== 0) {
				// Build the menu popup
				if (wet_boew_theme.menubar.length !== 0 || pe.secnav.length !== 0 || wet_boew_theme.search.length !== 0) {
					// Transform the menu to a popup
					mb_btn_txt = pe.dic.get('%menu');
					mb_li = wet_boew_theme.menubar.find('ul.mb-menu li');
					secnav_h2 = (pe.secnav.length !== 0 ? pe.secnav[0].getElementsByTagName('h2')[0] : '');
					mb_header_html = (wet_boew_theme.menubar.length !== 0 ? wet_boew_theme.psnb.children(':header')[0] : (pe.secnav.length !== 0 ? secnav_h2 : wet_boew_theme.bcrumb.children(':header')[0])).innerHTML;
					mb_popup = popup + ' id="jqm-wb-mb">' + popup_default_header_open + mb_btn_txt + '</h1>' + popup_close_btn + '</div><div data-role="content" data-inset="true"><nav role="navigation">';

					if (wet_boew_theme.bcrumb.length !== 0) {
						node = wet_boew_theme.bcrumb[0];
						home_href = node.getElementsByTagName('a')[0].href;
						mb_popup += '<section><div id="jqm-mb-location-text">' + node.innerHTML + '</div></section>';
					} else {
						mb_popup += '<div id="jqm-mb-location-text"></div>';
					}

					// Build the menu
					if (pe.secnav.length !== 0) {
						mb_menu += '<section><div><h2>' + secnav_h2.innerHTML + '</h2>' + pe.menu.buildmobile(pe.secnav.find('.wb-sec-def'), 3, 'b', false, true, 'c', true, true) + '</div></section>';
						node = pe.secnav[0];
					}
					if (wet_boew_theme.menubar.length !== 0) {
						mb_menu += '<section><div><h2>' + mb_header_html + '</h2>' + pe.menu.buildmobile(mb_li, 3, 'a', true, true, 'c', true, true) + '</div></section>';
					}
					
					// Append the popup/dialog container and store the menu for appending later
					mb_popup += '<div id="jqm-mb-menu"></div></nav></div></div></div>';
					bodyAppend += mb_popup;
					wet_boew_theme.menu = mb_menu;
					_list += popup_button + ' data-icon="bars" href="#jqm-wb-mb">' + mb_btn_txt + '</a>';
				}
			
				// Build the search popup (content pages only)
				if (wet_boew_theme.search.length !== 0) {
					// :: Search box transform lets transform the search box to a popup
					srch_btn_txt = pe.dic.get('%search');
					s_form = wet_boew_theme.search[0];
					s_form_html = s_form.innerHTML;
					s_form = s_form.getElementsByTagName('input');
					len = s_form.length;
					while (len--) {
						s_form[len].setAttribute('data-role', 'none');
					}
					s_popup = popup + ' id="jqm-wb-search">' + popup_default_header_open + srch_btn_txt + '</h1>' + popup_close_btn + '</div><div data-role="content"><div>' + s_form_html.substring(s_form_html.indexOf('<form')) + '</div></div></div>';
					bodyAppend += s_popup;
					_list += popup_button + ' data-icon="search" href="#jqm-wb-search">' + srch_btn_txt + '</a>';
				}
			
				// Build the header bar
				header = '<div data-role="header"><div class="ui-title"></div>';
				header += '<map id="base-mnavbar" data-role="controlgroup" data-type="horizontal" class="ui-btn-right wb-hide">';
				// Handling for the home/back button if it exists
				if (typeof home_href !== 'undefined') { // Home button needed
					header += button + ' href="' + home_href + '" data-icon="home">' + pe.dic.get('%home') + '</a>';
				} else if (true === false) { // Back button needed (TODO: need better condition, back link exists?)
					// TODO: Determine source of back href (link?)
					header += button + ' href="' + '#back-href' + '" data-icon="back">' + pe.dic.get('%back') + '</a>';
				}
				// Append the Menu and Search buttons if they exist
				if (_list.length !== 0) {
					header += _list;
				}
				// Append the Settings button
				header += popup_button + ' href="#popupSettings" data-icon="gear">' + settings_txt + '</a></map></div>';
				// Append the header
				wet_boew_theme.fullhd.children('#base-fullhd-in').before(header);
				// Apply a theme to the site title
				wet_boew_theme.title[0].className += ' ui-bar-b';
			
				// Build the settings popup
				lang_links = wet_boew_theme.fullhd.find('li[id*="-lang"]');
				settings_popup = popup + ' id="popupSettings"' + popup_settings;
				settings_popup += popup_settings_header_open + settings_txt + '</h1>' + popup_close_btn + '</div>';
				settings_popup += popup_settings_content_open + listView + '>';
				if (lang_links.length > 0) {
					settings_popup += '<li><a href="#popupLanguages"' + popup_link + '>' + pe.dic.get('%languages') + '</a></li>';
				}
				settings_popup += '<li class="ui-corner-bottom"><a href="#popupAbout"' + popup_link + '>' + pe.dic.get('%about') + '</a></li>';
				settings_popup += '</ul>' + popup_close;

				// Build the languages sub-popup
				if (lang_links.length > 0) {
					settings_popup += popup + ' id="popupLanguages"' + popup_settings;
					settings_popup += popup_settings_header_open + pe.dic.get('%languages') + '</h1>' + popup_back_btn_open + ' href="#popupSettings"' + popup_back_btn_close + popup_close_btn + '</div>';
					settings_popup += popup_settings_content_open + listView + '>';
					if (lang_links.filter('[id*="-lang-current"]').length === 0) {
						settings_popup += '<li><a href="javascript:;" class="ui-disabled">' + pe.dic.get('%lang-native') + pe.dic.get('%current') + '</a></li>';
					}
					nodes = lang_links.get();
					len = nodes.length;
					while (len--) {
						node = nodes[i];
						link = node.childNodes[0];
						settings_popup += '<li' + (i === (len - 1) ? ' class="ui-corner-bottom"' : '');
						if (node.id.indexOf('-lang-current') !== -1) {
							settings_popup += '><a href="javascript:;" class="ui-disabled">' + node.innerHTML + pe.dic.get('%current') + '</a></li>';
						} else {
							settings_popup += '><a href="' + link.href + '" lang="' + link.getAttribute('lang') + '">' + link.innerHTML + '</a></li>';
						}
					}
					settings_popup += '</ul>' + popup_close;
				}

				// Build the about sub-popup	
				settings_popup += popup + ' id="popupAbout"' + popup_settings;
				settings_popup += popup_settings_header_open + pe.dic.get('%about') + '</h1>' + popup_back_btn_open + ' href="#popupSettings"' + popup_back_btn_close + popup_close_btn + '</div>';			
				settings_popup += popup_settings_content_open;
				settings_popup += '<div class="site-app-title"><div class="ui-title">' + wet_boew_theme.title.text() + '</div></div>';
				// Add the version
				node = pe.main.find('#base-date-mod').children();
				if (node.length !== 0) {
					target = node[1];
					if (target.getElementsByTagName('time').length === 0) {
						settings_popup += '<div class="app-version">' + node[0].innerHTML + ' ' + target.innerHTML + '</div>';
					}
				}
				settings_popup += listView + ' data-inset="true">';
				// Add the footer links
				links = wet_boew_theme.sft.find('.base-col-head a').get();
				for (i = 0, len = links.length; i !== len; i += 1) {
					link = links[i];
					node = link.innerHTML;
					target = node.toLowerCase();
					settings_popup += '<li' + (i === (len - 1) ? ' class="ui-corner-bottom"' : '') + '><a href="' + link.href + '">' + node + '</a></li>';	
				}

				// Close the settings popup
				settings_popup += '</ul>' + popup_close;

				// Append all the popups to the body
				pe.bodydiv.append(bodyAppend + settings_popup);
			}

			// jQuery mobile has loaded
			$(document).on('pagecreate', function () {
				if (_list.length !== 0) {
					var navbar = wet_boew_theme.fullhd.find('#base-mnavbar'),
						menu = pe.bodydiv.find('#jqm-mb-menu'),
						menus,
						nodes,
						nodes2,
						node2;
					navbar.removeClass('wb-hide');

					// Defer appending of menu until after page is enhanced by jQuery Mobile, and
					// defer enhancing of menu until it is opened the first time (all to reduce initial page load time)
					if (menu.length !== 0) {
						menu.append(wet_boew_theme.menu);
						navbar.find('a[href="#jqm-wb-mb"]').one('click vclick', function () {
							// Enhance the menu
							menu.trigger('create');
							menus = menu.find('.ui-controlgroup');
							nodes = menus.get();
							len = nodes.length;
							while (len--) {
								node = nodes[len];
								// Fix the top corners
								node2 = node.getElementsByTagName('li')[0];
								if (node2.parentNode.parentNode.className.indexOf('ui-collapsible') === -1 && node2.className.indexOf('ui-corner-top') === -1) {
									node2.className += ' ui-corner-top';
								}

								// Fix the bottom corners
								nodes2 = menus.eq(len).find('.ui-btn').get();
								node = nodes2[nodes2.length - 1];
								if (node.className.indexOf('ui-corner-bottom') === -1) {
									node.className += ' ui-corner-bottom';
								}
							}
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
			$(document).trigger('themeviewloaded');
			return;
		},

		/* Special handling for the desktop view */
		desktopview: function () {
			// Disable jQuery Mobile enhancement of the form fields
			var elms,
				len;

			if (pe.ie > 0 && pe.ie < 9) {
				elms = $('input, textarea, select, button').get();
			} else {
				elms = document.querySelectorAll('input, textarea, select, button');
			}

			len = elms.length;
			while (len--) {
				elms[len].setAttribute('data-role', 'none');
			}

			$(document).trigger('themeviewloaded');
		}
	};

	/* window binding */
	window.wet_boew_theme = $.extend(true, wet_boew_theme, _wet_boew_theme);
	return window.wet_boew_theme;
}
(jQuery));
/*!
 *
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 *
 * Version: @wet-boew-build.version@
 *
 */
/*
 * GC Web Usability theme scripting
 */
/*global pe: false, wet_boew_mobile_view: false*/
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
		theme: 'theme-gcwu-fegc',
		psnb: null,
		search: null,
		bcrumb: null,
		title: null,
		sft: null,
		gcft: null,
		gridsmenu: null,
		menu: null,
		favicon: {
			href: 'images/favicon-mobile.png',
			rel: 'apple-touch-icon',
			sizes: '57x57 72x72 114x114 144x144 150x150'
		},
		init: function () {
			wet_boew_theme.gcnb = pe.header.find('#gcwu-gcnb');
			wet_boew_theme.psnb = pe.header.find('#gcwu-psnb');
			wet_boew_theme.menubar = wet_boew_theme.psnb.find('.wet-boew-menubar');
			wet_boew_theme.search = pe.header.find('#gcwu-srchbx');
			wet_boew_theme.bcrumb = pe.header.find('#gcwu-bc');
			wet_boew_theme.title = pe.header.find('#gcwu-title');
			wet_boew_theme.sft = pe.footer.find('#gcwu-sft');
			wet_boew_theme.gcft = pe.footer.find('#gcwu-gcft');
			wet_boew_theme.gridsmenu = pe.main.find('.module-menu-section');

			var current = pe.menu.navcurrent(wet_boew_theme.menubar, wet_boew_theme.bcrumb),
				submenu = current.parents('div.mb-sm'),
				len,
				elms,
				elm,
				object,
				swapPNG,
				contentPage;

			// If SVG is not properly supported, remove the objects for loading the SVG images and leave only the fallback image element
			// Also switch to the black PNG if printing a content page
			if (!pe.svg || pe.svgfix) {
				contentPage = wet_boew_theme.sft.length !== 0;
				swapPNG = function(toAlt) {
					var elms = $('#gcwu-wmms img, #gcwu-sig img, #gcwu-sig-coa img').get(),
						len = elms.length,
						image;
					while (len--) {
						image = elms[len];
						image.src = (toAlt ? image.src.replace('.png', '-alt.png') : image.src.replace('-alt.png', '.png'));
					}
				};
				if (contentPage) {
					window.onbeforeprint = function() {
						swapPNG(true);
					};
					window.onafterprint = function() {
						swapPNG(false);
					};
				}

				elms = $('#gcwu-wmms-in, #gcwu-sig-in, #gcwu-sig-coa-in').get();
				len = elms.length;
				while (len--) {
					elm = elms[len];
					object = elm.getElementsByTagName('object');
					if (object.length > 0) {
						elm.innerHTML = elm.innerHTML.replace(/<object[\s\S]*?\/object>/i, object[0].innerHTML);
					}
				}
			}

			// If the link with class="nav-current" is in the submenu, then move the class up to the associated menu bar link
			if (submenu.length !== 0) {
				submenu.prev().children('a').addClass('nav-current');
			}
			if (pe.secnav.length !== 0) {
				current = pe.menu.navcurrent(pe.secnav, wet_boew_theme.bcrumb);
				submenu = current.parents('ul');
				submenu.prev().children('a').addClass('nav-current-nocss');
			}
			if (wet_boew_theme.gridsmenu.length !== 0) {
				current = pe.menu.navcurrent(wet_boew_theme.gridsmenu, wet_boew_theme.bcrumb);
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
				mb_menu = '',
				mb_btn_txt,
				srch_btn_txt,
				settings_txt = pe.dic.get('%settings'),
				mainpage_txt = pe.dic.get('%hyphen') + pe.dic.get('%main-page'),
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
				footer1,
				lang_links,
				lang_nav,
				mb_li,
				target,
				i,
				j,
				len,
				len2,
				nodes,
				node,
				next,
				$document = $(document),
				home_href,
				header,
				wmms,
				sessionSettings,
				sessionSetting,
				signInOut,
				session,
				listviewOpen,
				sig,
				id,
				header_fixed = typeof wet_boew_mobile_view !== 'undefined' && wet_boew_mobile_view.header_fixed;

			// Content pages only
			if (wet_boew_theme.sft.length !== 0) {
				// Build the menu popup
				if (wet_boew_theme.menubar.length !== 0 || pe.secnav.length !== 0 || wet_boew_theme.bcrumb.length !== 0) {
					// Transform the menu to a popup
					mb_btn_txt = pe.dic.get('%menu');
					mb_li = wet_boew_theme.menubar.find('ul.mb-menu li');
					secnav_h2 = (pe.secnav.length !== 0 ? pe.secnav[0].getElementsByTagName('h2')[0] : '');
					mb_popup = popup + ' id="jqm-wb-mb" class="jqm-wb-mb">' + popup_default_header_open + mb_btn_txt + '</h1>' + popup_close_btn + '</div><div data-role="content" data-inset="true"><nav role="navigation">';

					if (wet_boew_theme.bcrumb.length !== 0) {
						node = wet_boew_theme.bcrumb[0];
						links = node.getElementsByTagName('a');
						if (links.length !== 0) {
							home_href = links[0].href;
						}
						mb_popup += '<section><div id="jqm-mb-location-text">' + node.innerHTML + '</div></section>';
					} else {
						mb_popup += '<div id="jqm-mb-location-text"></div>';
					}

					// Build the menu
					if (pe.secnav.length !== 0) {
						mb_menu += '<section><div><h2>' + secnav_h2.innerHTML + '</h2>' + pe.menu.buildmobile(pe.secnav.find('.wb-sec-def'), 3, 'b', false, true, 'c', true, true) + '</div></section>';
					}
					if (wet_boew_theme.menubar.length !== 0) {
						mb_menu += '<section><div><h2>' + wet_boew_theme.psnb.children(':header')[0].innerHTML + '</h2>' + pe.menu.buildmobile(mb_li, 3, 'a', true, true, 'c', true, true) + '</div></section>';
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
				header = '<div data-role="header"' + (header_fixed ? ' data-position="fixed"' : '') + '><div class="ui-title"><div></div></div><map id="gcwu-mnavbar" data-role="controlgroup" data-type="horizontal" class="ui-btn-right wb-hide">';
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
				wet_boew_theme.gcnb.children('#gcwu-gcnb-in').before(header);
				wet_boew_theme.gcnb.find('.ui-title').append($('#gcwu-wmms').clone());
				// Apply a theme to the site title
				wet_boew_theme.title[0].className += ' ui-bar-b';

				// Build the settings popup
				session = document.getElementById('wb-session');
				lang_links = wet_boew_theme.gcnb.find('li[id*="-lang"]');
				settings_popup = popup + ' id="popupSettings"' + popup_settings;
				settings_popup += popup_settings_header_open + settings_txt + '</h1>' + popup_close_btn + '</div>';
				settings_popup += popup_settings_content_open + listView + '>';
				if (session !== null) {
					sessionSettings = session.getElementsByClassName('settings');
					for (i = 0, len = sessionSettings.length; i !== len; i += 1) {
						sessionSetting = sessionSettings[i].getElementsByTagName('a')[0];
						settings_popup += '<li><a href="' + sessionSetting.getAttribute('href') + '">' + sessionSetting.innerHTML + '</a></li>';
					}
					signInOut = session.getElementsByClassName('session')[0].getElementsByTagName('a')[0];
					settings_popup += '<li><a href="' + signInOut.getAttribute('href') + '">' + signInOut.innerHTML + '</a></li>';
				}
				if (lang_links.length !== 0) {
					settings_popup += '<li><a href="#popupLanguages"' + popup_link + '>' + pe.dic.get('%languages') + '</a></li>';
				}
				settings_popup += '<li class="ui-corner-bottom"><a href="#popupAbout"' + popup_link + '>' + pe.dic.get('%about') + '</a></li>';
				settings_popup += '</ul>' + popup_close;

				// Build the languages sub-popup
				if (lang_links.length !== 0) {
					settings_popup += popup + ' id="popupLanguages"' + popup_settings;
					settings_popup += popup_settings_header_open + pe.dic.get('%languages') + '</h1>' + popup_back_btn_open + ' href="#popupSettings"' + popup_back_btn_close + popup_close_btn + '</div>';
					settings_popup += popup_settings_content_open + listView + '>';
					if (lang_links.filter('[id*="-lang-current"]').length === 0) {
						settings_popup += '<li><a href="javascript:;" class="ui-disabled">' + pe.dic.get('%lang-native') + ' <span class="current">' + pe.dic.get('%current') + '</span></a></li>';
					}
					nodes = lang_links.get();
					len = nodes.length;
					i = len;
					while (i--) {
						node = nodes[i];
						link = node.getElementsByTagName('a')[0];
						settings_popup += '<li' + (i === 0 ? ' class="ui-corner-bottom"' : '');
						if (node.id.indexOf('-lang-current') !== -1) {
							settings_popup += '><a href="javascript:;" class="ui-disabled">' + node.innerHTML + ' <span class="current">' + pe.dic.get('%current') + '</span></a></li>';
						} else {
							settings_popup += '><a href="' + link.href + '" lang="' + link.getAttribute('lang') + '">' + link.innerHTML + '</a></li>';
						}
					}
					settings_popup += '</ul>' + popup_close;
				}

				// Build the about sub-popup
				settings_popup += popup + ' id="popupAbout" data-theme="c" class="ui-corner-all jqm-wb-mb">';
				settings_popup += popup_settings_header_open + pe.dic.get('%about') + '</h1>' + popup_back_btn_open + ' href="#popupSettings"' + popup_back_btn_close + popup_close_btn + '</div>';
				settings_popup += popup_settings_content_open;
				settings_popup += '<div class="site-app-title"><div class="ui-title">' + wet_boew_theme.title[0].getElementsByTagName('a')[0].innerHTML + '</div></div>';
				// Add the version
				node = pe.main.find('#gcwu-date-mod').children();
				if (node.length !== 0) {
					target = node[1];
					if (target.getElementsByTagName('time').length === 0) {
						settings_popup += '<div class="app-version">' + node[0].innerHTML + ' ' + target.innerHTML + '</div>';
					}
				}
				settings_popup += '<div data-role="controlgroup" data-theme="c"><div data-role="collapsible-set" data-inset="false">';
				// Add the terms and conditions and transparency links
				settings_popup += listView + '>';
				links = document.getElementById('gcwu-tctr').getElementsByTagName('a');
				for (i = 0, len = links.length; i !== len; i += 1) {
					link = links[i];
					settings_popup += '<li class="top-level' + (i === 0 ? ' ui-corner-top' : '') + '"><a href="' + link.href + '">' + link.innerHTML + '</a></li>';
				}
				settings_popup += '</ul>';
				// Add the footer links
				nodes = wet_boew_theme.sft.find('.gcwu-col-head');
				listviewOpen = false;
				len = nodes.length;
				for (i = 0; i !== len; i += 1) {
					node = nodes.eq(i);
					link = node.children('a');
					next = node.find('+ ul, + address ul');
					target = link.length !== 0 ? link[0].innerHTML : node[0].innerHTML;
					if (next.length !== 0) {
						if (listviewOpen) {
							settings_popup += '</ul>';
							listviewOpen = false;
						}
						settings_popup += '<div class="wb-nested-menu" data-role="collapsible"><h2>' + target + '</h2>' + listView + '>';
						links = next[0].getElementsByTagName('a');
						for (j = 0, len2 = links.length; j !== len2; j += 1) {
							node = links[j];
							settings_popup += '<li><a href="' + node.href + '">' + node.innerHTML + '</a></li>';
						}
						if (link.length !== 0) {
							settings_popup += '<li><a href="' + link.attr('href') + '">' + link.html() + mainpage_txt + '</a></li>';
						}
						settings_popup += '</ul></div>';
					} else if (link.length !== 0) {
						if (!listviewOpen) {
							settings_popup += listView + '>';
							listviewOpen = true;
						}
						settings_popup += '<li class="top-level' + (i === 0 ? ' ui-corner-top' : '') + '"><a href="' + link.attr('href') + '">' + link.html() + '</a></li>';
					}
				}
				if (listviewOpen) {
					settings_popup += '</ul>';
				}

				// Add GC links
				sig = wet_boew_theme.gcnb.find('#gcwu-sig-in, #gcwu-sig-coa-in').children();
				if (sig.length !== 0) {
					settings_popup += '<div class="wb-nested-menu" data-role="collapsible"><h2>' + (typeof sig.attr('aria-label') !== 'undefined' ? sig.attr('aria-label') : sig.attr('alt')) + '</h2>' + listView + '>';
					nodes = wet_boew_theme.gcnb.find('li').add(wet_boew_theme.gcft.find('li')).get();
					len = nodes.length;
					for (i = 0; i !== len; i += 1) {
						node = nodes[i];
						id = node.id;
						if (id.indexOf('gcwu-gcnb-lang') === -1 && id !== 'gcwu-gcft-ca') {
							link = node.getElementsByTagName('a');
							if (link.length !== 0) {
								link = link[0];
								settings_popup += '<li><a href="' + link.href + (link.hasAttribute('target') ? '" target="' + link.getAttribute('target') : '') + '">' + link.innerHTML + '</a></li>';
							}
						}
					}
					settings_popup += '</ul></div>';
				}

				target = settings_popup.lastIndexOf('<li');
				len2 = settings_popup.indexOf('<li class', target) === target ? 11 : 3;
				settings_popup = settings_popup.substring(0, target) + '<li class="ui-corner-bottom' + (len2 === 3 ? '"' : ' ') + settings_popup.substring(target + len2) + '</ul></div></div>' + popup_close;

				// Append all the popups to the body
				pe.bodydiv.append(bodyAppend + settings_popup);
			} else {
				// Handling for splash page language buttons
				lang_links = document.getElementById('gcwu-lang');
				if (lang_links !== null) {
					nodes = lang_links.getElementsByTagName('li');
					lang_nav = '<div data-role="navbar"><ul>';
					for (i = 0, len = nodes.length; i < len; i += 1) {
						node = nodes[i];
						link = node.getElementsByTagName('a')[0];
						lang_nav += '<li><a href="' + link.href + '"' + (node.hasAttribute('lang') ? ' lang="' + node.getAttribute('lang') + '"' : '') + ' data-theme="a">' + link.innerHTML + '</a></li>';
					}
					lang_nav += '</ul></div>';
					document.getElementById('gcwu-ef-lang').parentNode.innerHTML = lang_nav;
					lang_links = document.getElementById('gcwu-other-lang');
					if (lang_links !== null) {
						lang_links.parentNode.removeChild(lang_links);
					}
				}

				// Handling for the terms and conditions links
				target = document.getElementById('gcwu-tc');
				if (target !== null) {
					nodes = target.getElementsByTagName('li');

					// Transform the footer into a nav bar
					footer1 = '<ul class="ui-grid-a">';
					for (i = 0, len = nodes.length; i < len; i += 1) {
						node = nodes[i];
						link = node.getElementsByTagName('a')[0];
						footer1 += '<li class="ui-block-' + (i % 2 !== 0 ? 'b' : 'a') + '"><a href="' + link.href + '"' + (node.hasAttribute('lang') ? ' lang="' + node.getAttribute('lang') + '"' : '') + ' data-role="button" data-theme="c" data-corners="false">' + link.innerHTML + '</a></li>';
					}
					footer1 += '</ul>';
					target.id = '';
					target.className = '';
					target.setAttribute('data-role', 'footer');
					target.innerHTML = footer1;
				}

				// Move the Canada Wordmark to the footer
				wmms = document.getElementById('gcwu-wmms');
				if (wmms !== null) {
					pe.footer[0].getElementsByTagName('footer')[0].appendChild(wmms);
				}
			}

			// jQuery mobile has loaded
			$document.on('pagecreate', function () {
				var navbar = wet_boew_theme.gcnb.find('#gcwu-mnavbar'),
					menu = pe.bodydiv.find('#jqm-mb-menu'),
					nodes,
					nodes2,
					node2,
					len;
				if (navbar.length !== 0) {
					// Manually initializes the navbar controlgroup if it doesn't initialize normally (can happen in IE)
					if (!navbar.hasClass('ui-controlgroup')) {
						navbar.controlgroup();
					}
					navbar.removeClass('wb-hide');

					// Defer appending of menu until after page is enhanced by jQuery Mobile, and
					// defer enhancing of menu until it is opened the first time (all to reduce initial page load time)
					if (menu.length !== 0) {
						menu.append(wet_boew_theme.menu);
						navbar.find('a[href="#jqm-wb-mb"]').one('click vclick', function () {
							// Enhance the menu
							menu.trigger('create');
							nodes = menu[0].getElementsByClassName('ui-controlgroup');
							len = nodes.length;
							while (len--) {
								node = nodes[len];

								// Fix the top corners
								node2 = node.getElementsByTagName('li')[0];
								if (node2.parentNode.parentNode.parentNode.className.indexOf('ui-collapsible') === -1 && node2.className.indexOf('ui-corner-top') === -1) {
									node2.className += ' ui-corner-top';
								}

								// Fix the bottom corners
								nodes2 = node.getElementsByClassName('ui-btn');
								node2 = nodes2[nodes2.length - 1];
								if (typeof node2 !== 'undefined' && node2.className.indexOf('ui-corner-bottom') === -1) {
									node2.className += ' ui-corner-bottom';
								}
							}
						});
					}
				}

				// Transition to show loading icon on transition
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
			$document.trigger('themeviewloaded');
			return;
		},

		/* Special handling for the desktop view */
		desktopview: function () {
			// Disable jQuery Mobile enhancement of the form fields
			var elms,
				len;

			if (pe.preIE9) {
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

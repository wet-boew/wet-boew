/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * GC Web Usability theme scripting
 */
/*global jQuery: false, pe: false*/
(function ($) {
	var wet_boew_theme, _wet_boew_theme;
	/**
	* wet_boew_theme object
	* @namespace wet_boew_theme
	* @version 1.3
	*/
	wet_boew_theme = (typeof window.wet_boew_theme !== "undefined" && window.wet_boew_theme !== null) ? window.wet_boew_theme : {
		fn: {}
	};
	_wet_boew_theme = {
		theme: 'theme-gcwu-fegc',
		psnb: $('#wb-head #gcwu-psnb'),
		search: $('#wb-head #gcwu-srchbx'),
		bcrumb: $('#wb-head #gcwu-bc'),
		title: $('#wb-head #gcwu-title'),
		sft: $('#wb-foot #gcwu-sft'),
		footer: $('#wb-foot footer'),
		gcft: $('#wb-foot #gcwu-gcft'),
		wmms: $('#gcwu-wmms'),
		init: function () {
			pe.theme = wet_boew_theme.theme;
			$('html').addClass(wet_boew_theme.theme);
			if (wet_boew_theme.psnb.length > 0 && wet_boew_theme.search.length === 0) {
				wet_boew_theme.psnb.css('width', '100%');
			}
		},
		themename: function () {
			return wet_boew_theme.theme;
		},
		buildmenu: function (section, hlevel, theme, menubar) {
			var menu = $('<div data-role="controlgroup"></div>'), menuitems, next, subsection, hlink, nested;
			menuitems = section.find('> div, > ul, h' + hlevel);
			if (menuitems.first().is('ul')) {
				menu.append($('<ul data-role="listview" data-theme="' + theme + '"></ul>').append(menuitems.first().children('li')));
			} else {
				menuitems.each(function (index) {
					var $this = $(this);
					// If the menu item is a heading
					if ($this.is('h' + hlevel)) {
						hlink = $this.children('a');
						subsection = $('<div data-role="collapsible"><h' + hlevel + '>' + $this.text() + '</h' + hlevel + '></div>');
						// If the original menu item was in a menu bar
						if (menubar) {
							$this = $this.parent().find('a').eq(1).closest('ul, div, h' + hlevel + 1).first();
							next = $this;
						} else {
							next = $this.next();
						}

						if (next.is('ul')) {
							// The original menu item was not in a menu bar
							if (!menubar) {
								next.prepend('<li><a href="' + hlink.attr('href') + '">' + hlink.html() + ' - ' + pe.dic.get('%home') + '</a></li>');
							}
							nested = next.find('li ul');
							// If a nested list is detected
							nested.each(function (index) {
								var $this = $(this);
								hlink = $this.prev('a');
								// Make the nested list into a collapsible section
								$this.attr('data-role', 'listview').attr('data-theme', theme).wrap('<div data-role="collapsible"></div>');
								$this.parent().prepend('<h' + (hlevel + 1 + index) + '>' + hlink.html() + '</h' + (hlevel + 1 + index) + '>');
								$this.prepend('<li><a href="' + hlink.attr('href') + '">' + hlink.html() + ' - ' + pe.dic.get('%home') + '</a></li>');
								hlink.remove();
							});
							subsection.append($('<ul data-role="listview" data-theme="' + theme + '"></ul>').append(next.children('li')));
							subsection.find('ul').wrap('<div data-role="controlgroup">' + (nested.length > 0 ? "<div data-role=\"collapsible-set\" data-theme=\"" + theme + "\"></div>" : "") + '</div>');
						} else {
							// If the section contains sub-sections
							subsection.append(wet_boew_theme.buildmenu($this.parent(), hlevel + 1, theme, false));
							// If the original menu item was not in a menu bar
							if (!menubar) {
								subsection.find('div[data-role="collapsible-set"]').eq(0).prepend($this.children('a').attr('href', hlink.attr('href')).html(hlink.html() + ' - ' + pe.dic.get('%home')).attr('data-role', 'button').attr('data-theme', theme).attr('data-icon', 'arrow-r').attr('data-iconpos', 'right'));
							}
						}
						menu.append(subsection);
					} else if ($this.is('div')) { // If the menu item is a div
						menu.append($this.children('a').attr('data-role', 'button').attr('data-theme', theme).attr('data-icon', 'arrow-r').attr('data-iconpos', 'right'));
					}
				});
				menu.children().wrapAll('<div data-role="collapsible-set" data-theme="' + theme + '"></div>');
			}
			return menu;
		},
		mobileview: function () {
			var mb_dialogue, mb_header, s_dialogue, _list, links, footer1, ul, lang_links, lang_nav;
			if (pe.menubar.length > 0) {
				// @TODO: optimize the dom manipulation routines - there is alot of DOM additions that should be keep as a document frag and replaced with .innerHTML as the end. // jsperf - 342% increase
				// lets transform the menu to a dialog box
				mb_dialogue = '<div data-role="page" id="jqm-wb-mb"><div data-role="header">';
				mb_header = wet_boew_theme.psnb.children(':header');
				mb_dialogue += "<h1>" + mb_header.html() + '</h1></div>';
				mb_dialogue += '<div data-role="content" data-inset="true"><nav role="navigation">';

				if (wet_boew_theme.bcrumb.length > 0) {
					mb_dialogue += '<section><div id="jqm-mb-location-text">' + wet_boew_theme.bcrumb.html() + '</div></section>';
					wet_boew_theme.bcrumb.remove();
				} else {
					mb_dialogue += '<div id="jqm-mb-location-text"></div>';
				}

				if (pe.secnav.length > 0) {
					mb_dialogue += $('<section><h2>' + pe.secnav.find('h2').eq(0).html() + '</h2></section>').append(wet_boew_theme.buildmenu(pe.secnav.find('.wb-sec-def'), 3, "c", false)).html();
					pe.secnav.remove();
				}

				mb_dialogue += $('<section><h2>' + mb_header.html() + '</h2></section>').append(wet_boew_theme.buildmenu(pe.menubar.find('ul.mb-menu li'), 3, "a", true)).html();
				mb_dialogue += '</nav></div></div></div>';
				pe.pagecontainer().append(mb_dialogue);
				mb_header.wrapInner('<a href="#jqm-wb-mb" data-rel="dialog"></a>');
				_list = $('<ul></ul>').hide().append('<li><a data-rel="dialog" data-theme="b"  data-icon="grid" href="' + mb_header.find('a').attr('href') + '">' + mb_header.find('a').text() + "</a></li>");

				if (wet_boew_theme.search.length > 0) {
					// :: Search box transform lets transform the search box to a dialog box
					s_dialogue = $('<div data-role="page" id="jqm-wb-search"></div>');
					s_dialogue.append($('<div data-role="header"><h1>' + wet_boew_theme.search.find(':header').text() + '</h1></div>')).append($('<div data-role="content"></div>').append(wet_boew_theme.search.find('form').clone()));
					pe.pagecontainer().append(s_dialogue);
					wet_boew_theme.search.find(':header').wrapInner('<a href="#jqm-wb-search" data-rel="dialog"></a>');
					_list.append('<li><a data-rel="dialog" data-theme="b" data-icon="search" href="' + wet_boew_theme.search.find(':header a').attr('href') + '">' + wet_boew_theme.search.find(':header a').text() + "</a></li>");
				}

				wet_boew_theme.title.after($('<div data-role="navbar" data-iconpos="right"></div>').append(_list));
			}

			lang_links = $('body #gcwu-lang');
			if (lang_links.length > 0) {
				links = lang_links.find('a').attr("data-theme", "a");
				lang_nav = $('<div data-role="navbar"><ul></ul></div>');
				ul = lang_nav.children();
				links.each(function () {
					ul.append($('<li/>').append(this));
				});
				lang_links.find('#gcwu-ef-lang').replaceWith(lang_nav.children().end());
				lang_links.find('#gcwu-other-lang').remove();
			}

			if (wet_boew_theme.sft.length > 0) {
				// transform the footer into mobile nav bar
				links = wet_boew_theme.sft.find('#gcwu-sft-in #gcwu-tctr a, #gcwu-sft-in .gcwu-col-head a').attr("data-theme", "b");
				footer1 = $('<div data-role="navbar"><ul></ul></div>');
				ul = footer1.children();
				links.each(function () {
					ul.append($('<li/>').append(this));
				});
				wet_boew_theme.sft.children('#gcwu-sft-in').replaceWith(footer1.children().end());
				wet_boew_theme.gcft.parent().remove();
			} else if (pe.footer.find('#gcwu-tc').length > 0) {
				// transform the footer into mobile nav bar
				links = pe.footer.find('#gcwu-tc a').attr("data-theme", "b");
				footer1 = $('<div data-role="navbar"><ul></ul></div>');
				ul = footer1.children();
				links.each(function () {
					ul.append($('<li/>').append(this));
				});
				pe.footer.find('#gcwu-tc').replaceWith(footer1.children().end());
			}
			wet_boew_theme.footer.append(wet_boew_theme.wmms.detach());

			// jquery mobile has loaded
			$(document).on("mobileinit", function () {
				if (pe.menubar.length > 0) {
					wet_boew_theme.psnb.parent().remove();
					if (wet_boew_theme.search.length > 0) {
						wet_boew_theme.search.parent().remove();
					}
					_list.show();
				}
			});
			// preprocessing before mobile page is enhanced
			$(document).on("pageinit", function () {
				// Correct the corners for each of the site menu/secondary menu sections and sub-sections
				$('#jqm-wb-mb').find('.ui-collapsible-set').each(function () {
					var $this = $(this);
					if ($this.find('> ul .ui-collapsible').length > 0) {
						$this = $this.children('ul');
					}
					$this.children().each(function () {
						var $this = $(this), target = $this.is('a') ? $this : $this.find('a').first();
						if ($this.prev().length > 0) {
							target.removeClass('ui-corner-top');
						}
						if ($this.next().length > 0) {
							target.removeClass('ui-corner-bottom');
						}
					});
				});
			});
			return;
		}
	};
	/* window binding */
	window.wet_boew_theme = $.extend(true, wet_boew_theme, _wet_boew_theme);
	return window.wet_boew_theme;
}
(jQuery));
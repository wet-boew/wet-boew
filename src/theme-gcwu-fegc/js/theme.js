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
		init: function () {
			pe.theme = 'theme-gcwu-fegc';
			$('html').addClass(pe.theme);
		},
		mobileview: function () {
			var mb_dialogue, mb_header, bcrumb, sub, search_elm, s_dialogue, _list, links, footer1, ul, lang_links, lang_nav;
			if (pe.menubar.length > 0) {
				// lets init some variables for use in various transformations
				// raw variable running on the dom
				// @TODO: optimize the dom manipulation routines - there is alot of DOM additions that should be keep as a document frag and replaced with .innerHTML as the end. // jsperf - 342% increase
				// lets transform the menu to a dialog box
				mb_dialogue = '<div data-role="page" id="jqmobile-wet-boew-menubar"><div data-role="header">';
				mb_header = pe.header.find('#gcwu-psnb > :header');
				mb_dialogue += "<h1>" + mb_header.html() + '</h1></div>';
				mb_dialogue += '<div data-role="content" data-inset="true"><nav role="navigation">';

				bcrumb = pe.header.find('#gcwu-bc');
				if (bcrumb.length > 0) {
					mb_dialogue += '<div id="jqm-mb-location-text">' + bcrumb.html() + '</div>';
					bcrumb.remove();
				} else {
					mb_dialogue += '<div id="jqm-mb-location-text"></div>';
				}

				if (pe.secnav.length > 0) {
					// we have a submenu
					sub = '<h2>' + pe.secnav.find(':header').eq(0).html() + '</h2>';
					sub += '<div data-role="collapsible-set">';
					sub += pe.secnav.find('.wb-sec-def').html().replace(/<section>/gi, "<div data-role=\"collapsible\">").replace(/<\/section>/gi, "</div>");

					// lets work on the menu shift
					sub = sub.replace(/<h(.*?)>\s*<a/gmi, "<h$1><a class=\"ui-link\" data-icon=\"arrow-r\" data-theme=\"b\"");
					sub = sub.replace(/<ul(.*?)>/gi, "<ul data-role=\"listview\"$1>").replace(/<\/ul>/gi, "</ul>");
					sub = sub.replace(/<div class=\"top-level\"/gmi, "<div data-role=\"button\" data-icon=\"arrow-r\" class=\"top-level\"");
					sub += '</div>';
					mb_dialogue += sub;
					pe.secnav.remove();
				}

				mb_dialogue += '<h2>' + mb_header.html() + '</h2>';
				mb_dialogue += '<div data-role=\"collapsible-set\">';

				pe.menubar.find('ul.mb-menu').clone().each(function () {
					$(this).find('div[class^=span]').each(function () {
						$(this).replaceWith($(this).html());
					});
					$(this).find('.mb-sm').each(function () {
						$(this).html('<div data-role=\"collapsible-set\">' + $(this).html() + '</div)');
					});
					$(this).children().children('div:first-child,h2,h3,h4,section').each(function () {
						var $this = $(this);
						if ($this.is('section')) {
							$this = $this.children('h2,h3,h4').eq(0);
						}
						$this.html($this.text());
						if ($this.is('div')) {
							mb_dialogue += "<div data-role=\"button\" data-icon=\"arrow-r\" data-corners=\"false\" class=\"top-level" + ($this.parent().is("li:first-child") ? " ui-corner-top" : (($this.parent().is("li:last-child") ? " ui-corner-bottom" : ""))) + "\" data-theme=\"a\">" + $(this).html() + "</div>";
						} else {
							$this.parent().find("ul").attr("data-role", "listview");
							$this.parent().find(".mb-sm div > a,.mb-sm h2,.mb-sm h3,.mb-sm h4").each(function () {
								var $this_sub = $(this), $this_sub_parent = $this_sub.parent();
								if ($this_sub_parent.is('div')) {
									$this_sub_parent.html($this_sub_parent.text());
									$this_sub_parent.attr('data-role', 'button').attr('data-icon', 'arrow-r').attr('data-corners', 'false').attr('data-theme', 'a').addClass('top-level' + ($this.parent().is("li:first-child") ? " ui-corner-top" : (($this.parent().is("li:last-child") ? " ui-corner-bottom" : ""))));
								} else if ($this_sub_parent.is('section')) {
									$this_sub.html($this_sub.text());
									$this_sub_parent.wrap("<div data-role=\"collapsible\" data-theme=\"a\">");
									$this_sub_parent.parent().html($this_sub_parent.html());
								}
							});
							mb_dialogue += "<div data-role=\"collapsible\" data-theme=\"a\">" + $this.parent().html() + "</div>";
						}
					});
				});
				mb_dialogue += '</nav></div>';

				mb_dialogue += '</div></div>';
				pe.pagecontainer().append(mb_dialogue);
				mb_header.wrapInner('<a href="#jqmobile-wet-boew-menubar" data-rel="dialog"></a>');
			}

			search_elm = pe.header.find('#gcwu-srchbx');
			if (search_elm.length > 0) {
				// :: Search box transform lets transform the search box to a dialogue box
				s_dialogue = $('<div data-role="page" id="jqmobile-wet-boew-search"></div>');
				s_dialogue.append($('<div data-role="header"><h1>' + search_elm.find(':header').text() + '</h1></div>')).append($('<div data-role="content"></div>').append(search_elm.find('form').clone()));
				pe.pagecontainer().append(s_dialogue);
				search_elm.find(':header').wrapInner('<a href="#jqmobile-wet-boew-search" data-rel="dialog"></a>');
				// lets see if we can change these to navbars
				_list = $('<ul></ul>').hide().append('<li><a data-rel="dialog" data-theme="b"  data-icon="grid" href="' + mb_header.find('a').attr('href') + '">' + mb_header.find('a').text() + "</a></li>").append('<li><a data-rel="dialog" data-theme="b" data-icon="search" href="' + search_elm.find(':header a').attr('href') + '">' + search_elm.find(':header a').text() + "</a></li>");
				pe.header.find('#gcwu-title').after($('<div data-role="navbar" data-iconpos="right"></div>').append(_list));
			}

			lang_links = $('#gcwu-lang');
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

			if (pe.footer.find('#gcwu-sft').length > 0) {
				// transform the footer into mobile nav bar
				links = pe.footer.find('#gcwu-sft-in #gcwu-tctr a, #gcwu-sft-in .gcwu-col-head a').attr("data-theme", "b");
				footer1 = $('<div data-role="navbar"><ul></ul></div>');
				ul = footer1.children();
				links.each(function () {
					ul.append($('<li/>').append(this));
				});
				pe.footer.find('#gcwu-sft-in').replaceWith(footer1.children().end());
				pe.footer.find('#gcwu-gcft').parent().remove();
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
			pe.footer.find('footer').append($('#gcwu-wmms').detach());

			// jquery mobile has loaded
			$(document).on("mobileinit", function () {
				if (pe.menubar.length > 0) {
					pe.header.find('#gcwu-psnb').parent().remove();
				}
				if (search_elm.length > 0) {
					search_elm.parent().remove();
					_list.show();
				}
			});
			// preprocessing before mobile page is enhanced
			$(document).on("pageinit", function () {
			});
			return;
		}
	};
	/* window binding */
	window.wet_boew_theme = $.extend(true, wet_boew_theme, _wet_boew_theme);
	return window.wet_boew_theme;
}
(jQuery));
/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * Share widget plugin
 */
/*global jQuery: false, pe:false, wet_boew_share:false */
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn : {}
	};
	/* local reference */
	_pe.fn.share = {
		type : 'plugin',
		depends : ['metadata', 'bookmark', 'outside'],
		_exec : function (elm) {
			var opts, overrides, $popup, $popupText, $popupLinks, target, leftoffset, keychar, elmtext, matches, match;

			// Defaults
			opts = {
				url: '', // The URL to bookmark, leave blank for the current page
				sourceTag: '', // Extra tag to add to URL to indicate source when it returns
				title: '', // The title to bookmark, leave blank for the current one
				description: '', // A longer description of the site
				sites: [], // List of site IDs or language selectors (lang:xx) or
					// category selectors (category:xx) to use, empty for all
				compact: false, // True if a compact presentation should be used, false for full
				hint: pe.dic.get('%share-text') + pe.dic.get('%share-hint'), // Popup hint for links, {s} is replaced by display name
				popup: true, // True to have it popup on demand, false to show always
				popupTag: 'h2', // Parent tag for the popup link (should be either h2 or h3)
				popupText: pe.dic.get('%share-text'), // Text for the popup trigger
				includeDisclaimer: true, // True to include the popup disclaimer (at the bottom)
				popupDisclaimer: pe.dic.get('%share-disclaimer'), // Text for the popup disclaimer
				hideText: (pe.dic.get('%hide') + " - "), // Text to prepend to the popup trigger when popup is open
				addFavorite: false,  // True to add a 'add to favourites' link, false for none
				favoriteText: pe.dic.get('%favourite'),  // Display name for the favourites link
				addEmail: false, // True to add a 'e-mail a friend' link, false for none
				emailText: pe.dic.get('%email'), // Display name for the e-mail link
				emailSubject: pe.dic.get('%share-email-subject'), // The subject for the e-mail
				emailBody: pe.dic.get('%share-email-body'), // The body of the e-mail,
					// use '{t}' for the position of the page title, '{u}' for the page URL,
					// '{d}' for the description, and '\n' for new lines
				manualBookmark: pe.dic.get('%share-manual'), // Instructions for manually bookmarking the page
				addShowAll: false, // True to show listed sites first, then all on demand
				showAllText: pe.dic.get('%share-showall'), // Display name for show all link, use '{n}' for the number of sites
				showAllTitle: pe.dic.get('%share-showall-title'), // Title for show all popup
				addAnalytics: false, // True to include Google Analytics for links
				analyticsName: '/share/{r}/{s}' // The "URL" that is passed to the Google Analytics,
					// use '{s}' for the site code, '{n}' for the site name,
					// '{u}' for the current full URL, '{r}' for the current relative URL,
					// or '{t}' for the current title
			};

			// Class-based overrides - use undefined where no override of defaults or settings.js should occur
			overrides = {
				compact: elm.hasClass("compact") ? true : undefined,
				popup: elm.hasClass("popup-none") ? false : undefined,
				addFavorite: elm.hasClass("favourite") ? true : undefined,
				addEmail: elm.hasClass("email") ? true : undefined,
				addShowAll: elm.hasClass("showall") ? true : undefined,
				addAnalytics: elm.hasClass('analytics') ? true : undefined
			};

			// Extend the defaults with settings passed through settings.js (wet_boew_share), class-based overrides and the data attribute
			$.metadata.setType("attr", "data-wet-boew");
			if (typeof wet_boew_share !== 'undefined' && wet_boew_share !== null) {
				$.extend(opts, wet_boew_share, overrides, elm.metadata());
			} else {
				$.extend(opts, overrides, elm.metadata());
			}

			elm.bookmark(opts);
			if (opts.popup && pe.cssenabled) {
				elm.attr('role', 'application');
				if (opts.popupTag.substring(0, 1) === 'h') { // If a heading element is used for the popup tag, then wrap the contents in a section element
					elm.wrapInner('<section />');
				}
				$popup = elm.find('.bookmark_popup').attr('id', 'bookmark_popup').attr('aria-hidden', 'true').attr('role', 'menu').prepend('<p class="popup_title">' + opts.popupText + '</p>');
				$popupLinks = $popup.find('li').attr('role', 'presentation').find('a').attr('role', 'menuitem').each(function () {
					// TODO: Should work with authot to fix in bookmark.js rather than maintain this workaround (fix needed otherwise some screen readers read the link twice)
					var $this = $(this),
						$span = $this.children('span');
					if ($span.length > 0) {
						$this.attr('title', $span.attr('title'));
						$span.removeAttr('title');
					}
				});
				if (opts.includeDisclaimer) {
					$popup.append('<p class="popup_disclaimer">' + opts.popupDisclaimer + '</p>');
				}

				$popup.on("click vclick touchstart", function (e) {
					if (e.stopPropagation) {
						e.stopImmediatePropagation();
					} else {
						e.cancelBubble = true;
					}
				});
				$popupText = elm.find('.bookmark_popup_text').off('click vclick touchstart keydown').wrap('<' + opts.popupTag + ' />');
				$popupText.attr('role', 'button').attr('aria-controls', 'bookmark_popup').on("click vclick touchstart keydown", function (e) {
					if (e.type === "keydown") {
						if (!(e.ctrlKey || e.altKey || e.metaKey)) {
							if (e.keyCode === 13 || e.keyCode === 32) { // enter or space
								e.preventDefault();
								if ($popup.attr('aria-hidden') === 'true') {
									$popup.trigger("open");
								} else {
									$popup.trigger("close");
								}
							} else if (e.keyCode === 38 || e.keyCode === 40) { // up or down arrow
								e.preventDefault();
								$popup.trigger("open");
							}
						}
					} else {
						if ($popup.attr('aria-hidden') === 'true') {
							$popup.trigger("open");
						} else {
							$popup.trigger("close");
						}
						return false;
					}
				});
				$popup.on("keydown focusoutside open close closenofocus", function (e) {
					if (e.type === "keydown") {
						if (!(e.ctrlKey || e.altKey || e.metaKey)) {
							switch (e.keyCode) {
							case 27: // escape key (close the popup)
								$popup.trigger("close");
								return false;
							case 37: // left arrow (go on link left, or to the right-most link in the previous row, or to the right-most link in the last row)
								target = $(e.target).closest('li').prev().find('a');
								if (target.length === 0) {
									target = $popupLinks;
								}
								pe.focus(target.last());
								return false;
							case 38: // up arrow (go one link up, or to the bottom-most link in the previous column, or to the bottom-most link of the last column)
								leftoffset = $(e.target).offset().left;
								target = $(e.target).closest('li').prevAll().find('a').filter(function () {
									return ($(this).offset().left === leftoffset);
								});
								if (target.length > 0) {
									pe.focus(target.first());
								} else {
									target = $popupLinks.filter(function () {
										return ($(this).offset().left < leftoffset);
									});
									if (target.length > 0) {
										pe.focus(target.last());
									} else {
										leftoffset = $popupLinks.last().offset().left;
										target = $popupLinks.filter(function () {
											return ($(this).offset().left > leftoffset);
										});
										if (target.length > 0) {
											pe.focus(target.last());
										} else {
											pe.focus($popupLinks.last());
										}
									}
								}
								return false;
							case 39: // right arrow (go one link right, or to the left-most link in the next row, or to the left-most link in the first row)
								target = $(e.target).closest('li').next().find('a');
								if (target.length === 0) {
									target = $popupLinks;
								}
								pe.focus(target.first());
								return false;
							case 40: // down arrow (go one link down, or to the top-most link in the next column, or to the top-most link of the first column)
								leftoffset = $(e.target).offset().left;
								target = $(e.target).closest('li').nextAll().find('a').filter(function () {
									return ($(this).offset().left === leftoffset);
								});
								if (target.length > 0) {
									pe.focus(target.first());
								} else {
									target = $popupLinks.filter(function () {
										return ($(this).offset().left > leftoffset);
									});
									if (target.length > 0) {
										pe.focus(target.first());
									} else {
										pe.focus($popupLinks.first());
									}
								}
								return false;
							default:
								// 0 - 9 and a - z keys (go to the next link that starts with that key)
								if ((e.keyCode > 47 && e.keyCode < 58) || (e.keyCode > 64 && e.keyCode < 91)) {
									keychar = String.fromCharCode(e.keyCode).toLowerCase();
									elmtext = $(e.target).text();
									matches = $popupLinks.filter(function () {
										return ($(this).text().substring(1, 2).toLowerCase() === keychar || $(this).text() === elmtext);
									});
									if (matches.length > 0) {
										if ($(e.target).hasClass('bookmark_popup_text')) {
											pe.focus(matches.eq(0));
										} else {
											matches.each(function (index) {
												if ($(this).text() === elmtext) {
													match = index;
													return false;
												}
											});
											if (match < (matches.length - 1)) {
												pe.focus(matches.eq(match + 1));
												return false;
											}
											pe.focus(matches.eq(0));
										}
									}
									return false;
								}
							}
						}
					} else if (e.type === "focusoutside" && !$(e.target).is($popupText)) { // Close the popup menu if focus goes outside
						if ($popup.attr('aria-hidden') === 'false') {
							$popup.trigger("closenofocus");
						}
					} else if (e.type === "open") { // Open the popup menu an put the focus on the first link
						$popupText.text(opts.hideText + opts.popupText);
						$popup.attr('aria-hidden', 'false').show();
						pe.focus($popup.show().find('li a').first());
					} else if (e.type === "close" || e.type === "closenofocus") { // Close the popup menu
						$popupText.text(opts.popupText);
						$popup.attr('aria-hidden', 'true').hide();
						if (e.type === "close") {
							pe.focus($popupText.first());
						}
					}
				});

				$(document).on("click vclick touchstart", function () {
					if ($popup.attr('aria-hidden') === 'false') {
						$popup.trigger("close");
					}
				});
			} else {
				elm.addClass('popup-none');
			}
			return elm;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}
(jQuery));
/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
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
		depends : ['bookmark'],
		_exec : function (elm) {
			var opts,
				overrides,
				$popup,
				popupDOM,
				$popupText,
				popupLinkListDOM,
				$popupLinks,
				popupLinksDOM,
				popupLink,
				popupLinksLen,
				popupLinkSpan,
				match;

			// Defaults
			opts = {
				url: '', // The URL to bookmark, leave blank for the current page
				sourceTag: '', // Extra tag to add to URL to indicate source when it returns
				title: '', // The title to bookmark, leave blank for the current one
				description: '', // A longer description of the site
				sites: [], // List of site IDs or language selectors (lang:xx) or
					// category selectors (category:xx) to use, empty for all
				compact: false, // True if a compact presentation should be used, false for full
				hint: pe.dic.get('%share-text') + pe.dic.get('%share-hint') + pe.dic.get('%new-window'), // Popup hint for links, {s} is replaced by display name
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
				compact: elm.hasClass('compact') ? true : undefined,
				popup: elm.hasClass('popup-none') ? false : undefined,
				addFavorite: elm.hasClass('favourite') ? true : undefined,
				addEmail: elm.hasClass('email') ? true : undefined,
				addShowAll: elm.hasClass('showall') ? true : undefined,
				addAnalytics: elm.hasClass('analytics') ? true : undefined
			};
			
			// Extend the defaults with settings passed through settings.js (wet_boew_share), class-based overrides and the data-wet-boew attribute
			$.extend(opts, (typeof wet_boew_share !== 'undefined' ? wet_boew_share : {}), overrides, _pe.data.getData(elm, 'wet-boew'));

			elm.bookmark(opts);
			if (opts.popup && pe.cssenabled) {
				elm.attr('role', 'application');
				if (opts.popupTag.substring(0, 1) === 'h') { // If a heading element is used for the popup tag, then wrap the contents in a section element
					elm.wrapInner('<section />');
				}
				$popup = elm.find('.bookmark_popup').detach();
				popupDOM = $popup[0];
				popupDOM.setAttribute('id', 'bookmark_popup');
				popupDOM.setAttribute('aria-hidden', 'true');
				popupDOM.setAttribute('role', 'menu');
				$popup.prepend('<p class="popup_title">' + opts.popupText + '</p>');
				popupLinkListDOM = popupDOM.getElementsByTagName('ul')[0];
				popupLinkListDOM.setAttribute('role', 'presentation');
				popupLinksDOM = popupLinkListDOM.getElementsByTagName('a');
				$popupLinks = $(popupLinksDOM);
				popupLinksLen = popupLinksDOM.length;
				while (popupLinksLen--) {
					popupLink = popupLinksDOM[popupLinksLen];
					popupLink.setAttribute('role', 'menuitem');
					popupLink.setAttribute('rel', 'external');
					popupLink.parentNode.setAttribute('role', 'presentation');
					// TODO: Should work with author to fix in bookmark.js rather than maintain this workaround (fix needed otherwise some screen readers read the link twice)
					popupLinkSpan = popupLink.getElementsByTagName('span');
					if (popupLinkSpan.length > 0) {
						popupLinkSpan = popupLinkSpan[0];
						popupLink.title = popupLinkSpan.title;
						popupLinkSpan.removeAttribute('title');
					}
				}
				if (opts.addEmail) { // Removes target attribute and opens in new window warning from email link
					match = $popup.find('a[href*="mailto:"]').removeAttr('target').removeAttr('rel');
					match.attr('title', match.attr('title').replace(pe.dic.get('%new-window'), ''));
				}
				if (opts.addFavorite) { // Removes target attribute and makes title more relevant for favorite link
					match = $popup.find('a[href*="#"]').removeAttr('target').removeAttr('rel').attr('title', opts.favoriteText + pe.dic.get('%share-fav-title'));
				}
				if (opts.includeDisclaimer) { // Append the disclaimer
					$popup.append('<p class="popup_disclaimer">' + opts.popupDisclaimer + '</p>');
				}
				elm.append($popup);

				$popup.on('click vclick touchstart focusin', function (e) {
					if (e.stopPropagation) {
						e.stopImmediatePropagation();
					} else {
						e.cancelBubble = true;
					}
				}).on('click vclick touchstart', 'a', function () { // Workaround for some touchscreen devices that don't 
					window.open(this.href, '_blank');
					$popup.trigger('close');
					return false;
				});

				$popupText = elm.find('.bookmark_popup_text').off('click vclick touchstart keydown').wrap('<' + opts.popupTag + ' />');
				$popupText.attr({'role': 'button', 'aria-controls': 'bookmark_popup'}).on('click vclick touchstart keydown', function (e) {
					if (e.type === "keydown") {
						if (!(e.ctrlKey || e.altKey || e.metaKey)) {
							if (e.keyCode === 13 || e.keyCode === 32) { // enter or space
								e.preventDefault();
								if ($popup.attr('aria-hidden') === 'true') {
									$popup.trigger('open');
								} else {
									$popup.trigger('close');
								}
							} else if (e.keyCode === 38 || e.keyCode === 40) { // up or down arrow
								e.preventDefault();
								$popup.trigger('open');
							}
						}
					} else {
						if ($popup.attr('aria-hidden') === 'true') {
							$popup.trigger('open');
						} else {
							$popup.trigger('close');
						}
						return false;
					}
				});
				$popup.on('keydown open close closenofocus', function (e) {
					if (e.type === 'keydown') {
						if (!(e.ctrlKey || e.altKey || e.metaKey)) {
							var target = $(e.target),
								leftoffset,
								keychar,
								matches,
								match,
								len,
								i,
								text,
								elmtext;
							switch (e.keyCode) {
							case 27: // escape key (close the popup)
								$popup.trigger('close');
								return false;
							case 37: // left arrow (go on link left, or to the right-most link in the previous row, or to the right-most link in the last row)
								target = target.closest('li').prev().find('a');
								if (target.length === 0) {
									target = $popupLinks;
								}
								pe.focus(target.last());
								return false;
							case 38: // up arrow (go one link up, or to the bottom-most link in the previous column, or to the bottom-most link of the last column)
								leftoffset = e.target.offsetLeft;
								target = target.closest('li').prevAll().find('a').filter(function () {
									return (this.offsetLeft === leftoffset);
								});
								if (target.length > 0) {
									pe.focus(target.first());
								} else {
									target = $popupLinks.filter(function () {
										return (this.offsetLeft < leftoffset);
									});
									if (target.length > 0) {
										pe.focus(target.last());
									} else {
										leftoffset = popupLinksDOM[popupLinksDOM.length - 1].offsetLeft;
										target = $popupLinks.filter(function () {
											return (this.offsetLeft > leftoffset);
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
								target = target.closest('li').next().find('a');
								if (target.length === 0) {
									target = $popupLinks;
								}
								pe.focus(target.first());
								return false;
							case 40: // down arrow (go one link down, or to the top-most link in the next column, or to the top-most link of the first column)
								leftoffset = e.target.offsetLeft;
								target = target.closest('li').nextAll().find('a').filter(function () {
									return (this.offsetLeft === leftoffset);
								});
								if (target.length > 0) {
									pe.focus(target.first());
								} else {
									target = $popupLinks.filter(function () {
										return (this.offsetLeft > leftoffset);
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
									elmtext = target.text();
									matches = $popupLinks.filter(function () {
										text = $(this).text();
										return (text.substring(1, 2).toLowerCase() === keychar);
									});
									if (matches.length !== 0) {
										if (target.hasClass('bookmark_popup_text') || elmtext.substring(1, 2).toLowerCase() !== keychar) {
											pe.focus(matches.eq(0));
										} else {
											match = matches.length;
											for (i = 0, len = match; i !== len; i += 1) {
												if (matches.eq(i).text() === elmtext) {
													match = i;
													break;
												}
											}
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
					} else if (e.type === 'open') { // Open the popup menu and put the focus on the first link
						$popupText.text(opts.hideText + opts.popupText);
						$popup.attr('aria-hidden', 'false').addClass('show');
						pe.focus($popup.find('li a').first());
					} else if (e.type === 'close' || e.type === 'closenofocus') { // Close the popup menu
						$popupText.text(opts.popupText);
						$popup.attr('aria-hidden', 'true').removeClass('show');
						if (e.type === 'close') {
							pe.focus($popupText.first());
						}
					}
				});

				_pe.document.on('click vclick touchstart focusin', function (e) {
					var className = e.target.className;
					if ($popup.attr('aria-hidden') === 'false' && (className === null || className.indexOf('bookmark_popup_text') === -1)) {
						if (e.type === 'focusin') {
							$popup.trigger('closenofocus');
						} else {
							$popup.trigger('close');
						}
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

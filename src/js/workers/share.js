/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
/*
 * Share widget plugin
 */
/*global wet_boew_share: false */
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn : {}
	};
	/* local reference */
	_pe.fn.share = {
		type : 'plugin',
		ignoreFocusoutside : false,
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
				popupLinksIndex,
				popupLinkSpan,
				match,
				lang = _pe.language,
				hintReverse = (lang === 'zh' || lang === 'zh-Hans' || lang === 'hi' || lang === 'ja' || lang === 'ko'),
				addSites,
				site,
				siteProps;

			// Defaults
			opts = {
				url: '', // The URL to bookmark, leave blank for the current page
				sourceTag: '', // Extra tag to add to URL to indicate source when it returns
				title: '', // The title to bookmark, leave blank for the current one
				description: '', // A longer description of the site
				sites: [], // List of site IDs or language selectors (lang:xx) or
					// category selectors (category:xx) to use, empty for all
				compact: false, // True if a compact presentation should be used, false for full
				hint: (hintReverse ? _pe.dic.get('%share-hint') + _pe.dic.get('%share-text') + ' ' : _pe.dic.get('%share-text') + _pe.dic.get('%share-hint')) + _pe.dic.get('%new-window'), // Popup hint for links, {s} is replaced by display name
				popup: true, // True to have it popup on demand, false to show always
				popupTag: 'h2', // Parent tag for the popup link (should be either h2 or h3)
				popupText: _pe.dic.get('%share-text'), // Text for the popup trigger
				includeDisclaimer: true, // True to include the popup disclaimer (at the bottom)
				popupDisclaimer: _pe.dic.get('%share-disclaimer'), // Text for the popup disclaimer
				hideText: (_pe.dic.get('%hide') + " - "), // Text to prepend to the popup trigger when popup is open
				addFavorite: false,  // True to add a 'add to favourites' link, false for none
				favoriteText: _pe.dic.get('%favourite'),  // Display name for the favourites link
				addEmail: false, // True to add a 'e-mail a friend' link, false for none
				emailText: _pe.dic.get('%email'), // Display name for the e-mail link
				emailSubject: _pe.dic.get('%share-email-subject'), // The subject for the e-mail
				emailBody: _pe.dic.get('%share-email-body'), // The body of the e-mail,
					// use '{t}' for the position of the page title, '{u}' for the page URL,
					// '{d}' for the description, and '\n' for new lines
				manualBookmark: _pe.dic.get('%share-manual'), // Instructions for manually bookmarking the page
				addShowAll: false, // True to show listed sites first, then all on demand
				showAllText: _pe.dic.get('%share-showall'), // Display name for show all link, use '{n}' for the number of sites
				showAllTitle: _pe.dic.get('%share-showall-title'), // Title for show all popup
				addAnalytics: false, // True to include Google Analytics for links
				analyticsName: '/share/{r}/{s}', // The "URL" that is passed to the Google Analytics,
					// use '{s}' for the site code, '{n}' for the site name,
					// '{u}' for the current full URL, '{r}' for the current relative URL,
					// or '{t}' for the current title
				addSites: {} // Object containing sites to add to the list in the following format "id": {display, icon, lang, category, url} (e.g., {"pinterest": {"display": "Pinterest", "icon": "/img/pinterest.jpg", "lang": "en", "category": "other", "url": "http://pinterest.com/pin/create/button/url={u}&title={t}"}})
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

			// Add sites
			addSites = opts.addSites;
			if (addSites.length !== 0) {
				for (site in addSites) {
					if (addSites.hasOwnProperty(site)) {
						siteProps = addSites[site];
						$.bookmark.addSite(site, siteProps.display, siteProps.icon, siteProps.lang, siteProps.category, siteProps.url);
					}
				}
			}

			// Initialize the widget
			elm.bookmark(opts);
			if (opts.popup && _pe.cssenabled) {
				if (opts.popupTag.substring(0, 1) === 'h') { // If a heading element is used for the popup tag, then wrap the contents in a section element
					elm.wrapInner('<section />');
				}
				$popup = elm.find('.bookmark_popup').detach();
				popupDOM = $popup[0];
				popupDOM.setAttribute('id', 'bookmark_popup');
				popupDOM.setAttribute('aria-hidden', 'true');
				$popup.prepend('<p class="popup_title">' + opts.popupText + '</p>');
				popupLinkListDOM = popupDOM.getElementsByTagName('ul')[0];
				popupLinkListDOM.setAttribute('role', 'menu');
				popupLinksDOM = popupLinkListDOM.getElementsByTagName('a');
				$popupLinks = $(popupLinksDOM);
				popupLinksLen = popupLinksDOM.length;
				popupLinksIndex = popupLinksLen;
				while (popupLinksIndex--) {
					popupLink = popupLinksDOM[popupLinksIndex];
					popupLink.setAttribute('role', 'menuitem');
					popupLink.setAttribute('rel', 'external');
					popupLink.setAttribute('aria-posinset', (popupLinksIndex + 1));
					popupLink.setAttribute('aria-setsize', popupLinksLen);
					// TODO: Should work with author to fix in bookmark.js rather than maintain this workaround (fix needed otherwise some screen readers read the link twice)
					popupLinkSpan = popupLink.getElementsByTagName('span');
					if (popupLinkSpan.length !== 0) {
						popupLinkSpan = popupLinkSpan[0];
						popupLink.title = popupLinkSpan.title;
						popupLinkSpan.removeAttribute('title');
					}
				}
				if (opts.addEmail) { // Removes target attribute and opens in new window warning from email link
					match = $popup.find('a[href*="mailto:"]').removeAttr('target').removeAttr('rel');
					match.attr('title', match.attr('title').replace(_pe.dic.get('%new-window'), ''));
				}
				if (opts.addFavorite) { // Removes target attribute and makes title more relevant for favorite link
					match = $popup.find('a[href*="#"]').removeAttr('target').removeAttr('rel').attr('title', opts.favoriteText + _pe.dic.get('%share-fav-title'));
				}
				if (opts.includeDisclaimer) { // Append the disclaimer
					$popup.append('<p class="popup_disclaimer">' + opts.popupDisclaimer + '</p>');
				}
				elm.append($popup);

				$popupText = elm.find('.bookmark_popup_text').off('click vclick touchstart keydown').wrap('<' + opts.popupTag + ' />');
				$popupText.attr({'role': 'button', 'aria-controls': 'bookmark_popup'}).on('click vclick touchstart keydown', function (e) {
					var keyCode = e.keyCode,
						button = e.button;

					if (e.type === 'keydown') {
						if (!(e.ctrlKey || e.altKey || e.metaKey)) {
							if (keyCode === 13 || keyCode === 32) { // enter or space
								e.preventDefault();
								if ($popup.attr('aria-hidden') === 'true') {
									$popup.trigger('open');
								} else {
									$popup.trigger('close');
								}
							} else if (keyCode === 38 || keyCode === 40) { // up or down arrow
								e.preventDefault();
								$popup.trigger('open');
							}
						}
					} else if (typeof button === 'undefined' || button === _pe.leftMouseButton) {
						if ($popup.attr('aria-hidden') === 'true') {
							$popup.trigger('open');
						} else {
							$popup.trigger('close');
						}
						return false;
					}
				});

				$popup.on('keydown open close closenofocus focusin mouseenter mouseleave', function (e) {
					var type = e.type,
						keyCode = e.keyCode,
						target,
						leftoffset,
						keychar,
						matches,
						match,
						len,
						i,
						elmtext;
					if (type === 'keydown') {
						if (!(e.ctrlKey || e.altKey || e.metaKey)) {
							target = $(e.target);
							if (keyCode === 27) { // escape key (close the popup)
								$popup.trigger('close');
								return false;
							} else if (keyCode === 37) { // left arrow (go on link left, or to the right-most link in the previous row, or to the right-most link in the last row)
								target = target.closest('li').prev().find('a');
								if (target.length === 0) {
									target = $popupLinks;
								}
								_pe.focus(target.last());
								return false;
							} else if (keyCode === 38) { // up arrow (go one link up, or to the bottom-most link in the previous column, or to the bottom-most link of the last column)
								leftoffset = e.target.offsetLeft;
								target = target.closest('li').prevAll().find('a').filter(function () {
									return (this.offsetLeft === leftoffset);
								});
								if (target.length > 0) {
									_pe.focus(target.first());
								} else {
									target = $popupLinks.filter(function () {
										return (this.offsetLeft < leftoffset);
									});
									if (target.length > 0) {
										_pe.focus(target.last());
									} else {
										leftoffset = popupLinksDOM[popupLinksDOM.length - 1].offsetLeft;
										target = $popupLinks.filter(function () {
											return (this.offsetLeft > leftoffset);
										});
										if (target.length > 0) {
											_pe.focus(target.last());
										} else {
											_pe.focus($popupLinks.last());
										}
									}
								}
								return false;
							} else if (keyCode === 39) { // right arrow (go one link right, or to the left-most link in the next row, or to the left-most link in the first row)
								target = target.closest('li').next().find('a');
								if (target.length === 0) {
									target = $popupLinks;
								}
								_pe.focus(target.first());
								return false;
							} else if (keyCode === 40) { // down arrow (go one link down, or to the top-most link in the next column, or to the top-most link of the first column)
								leftoffset = e.target.offsetLeft;
								target = target.closest('li').nextAll().find('a').filter(function () {
									return (this.offsetLeft === leftoffset);
								});
								if (target.length !== 0) {
									_pe.focus(target.first());
								} else {
									target = $popupLinks.filter(function () {
										return (this.offsetLeft > leftoffset);
									});
									if (target.length !== 0) {
										_pe.focus(target.first());
									} else {
										_pe.focus($popupLinks.first());
									}
								}
								return false;
							} else {
								// 0 - 9 and a - z keys (go to the next link that starts with that key)
								if ((keyCode > 47 && keyCode < 58) || (keyCode > 64 && keyCode < 91)) {
									keychar = String.fromCharCode(keyCode).toLowerCase();
									elmtext = target.text();
									matches = $popupLinks.filter(function () {
										return ($(this).text().substring(1, 2).toLowerCase() === keychar);
									});
									if (matches.length !== 0) {
										if (target.hasClass('bookmark_popup_text') || elmtext.substring(1, 2).toLowerCase() !== keychar) {
											_pe.focus(matches.eq(0));
										} else {
											match = matches.length;
											for (i = 0, len = match; i !== len; i += 1) {
												if (matches.eq(i).text() === elmtext) {
													match = i;
													break;
												}
											}
											if (match < (matches.length - 1)) {
												_pe.focus(matches.eq(match + 1));
												return false;
											}
											_pe.focus(matches.eq(0));
										}
									}
									return false;
								}
							}
						}
					} else if (type === 'click' || type === 'vclick' || type === 'touchstart' || type === 'focusin') {
						if (e.stopPropagation) {
							e.stopImmediatePropagation();
						} else {
							e.cancelBubble = true;
						}
					} else if (e.type === 'open') { // Open the popup menu and put the focus on the first link
						$popupText.text(opts.hideText + opts.popupText);
						$popup.attr('aria-hidden', 'false').addClass('show');
						_pe.focus($popup.find('li a').first());
					} else if (e.type === 'close' || e.type === 'closenofocus') { // Close the popup menu
						$popupText.text(opts.popupText);
						$popup.attr('aria-hidden', 'true').removeClass('show');
						if (e.type === 'close') {
							_pe.focus($popupText.first());
						}
					} else if (type === 'mouseenter') { // Mouse hover so ignore click away from link but in popup
						_pe.fn.share.ignoreFocusoutside = true;
					} else if (type === 'mouseleave') {
						_pe.fn.share.ignoreFocusoutside = false;
					}
				}).on('click vclick touchstart', 'a', function (e) { // Workaround for some touchscreen devices that don't handle a 'click' on a link
					var button = e.button;
					if (typeof button === 'undefined' || button === _pe.leftMouseButton) { // Ignore middle/right mouse buttons
						window.open(this.href, '_blank');
						$popup.trigger('close');
						return false;
					}
				});

				_pe.document.on('click vclick touchstart focusin', function (e) {
					var className = e.target.className,
						button = e.button;
					if (!_pe.fn.share.ignoreFocusoutside && $popup.attr('aria-hidden') === 'false' && (className === null || className.indexOf('bookmark_popup_text') === -1)) {
						if (e.type === 'focusin') {
							$popup.trigger('closenofocus');
						} else if (typeof button === 'undefined' || button === _pe.leftMouseButton) {
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

/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * Share widget plugin
 */
/*global jQuery: false, pe:false, wet_boew_share:false, data:false */
(function ($) {
	var _pe = window.pe || {
		fn : {}
	};
	/* local reference */
	_pe.fn.share = {
		type : 'plugin',
		depends : ['bookmark', 'metadata'],
		_exec : function (elm) {
			var $scope = $(elm), opts, $popup, $popupText;
			
			opts = { // See bookmark.js for details
				url: '',  // The URL to bookmark, leave blank for the current page
				sourceTag: '', // Extra tag to add to URL to indicate source when it returns
				title: '',  // The title to bookmark, leave blank for the current one
				description: '',  // A longer description of the site
				sites: [],  // List of site IDs or language selectors (lang:xx) or
					// category selectors (category:xx) to use, empty for all
				compact: $scope.hasClass("compact"),  // True if a compact presentation should be used, false for full
				hint: pe.dic.get('%share-hint'),  // Popup hint for links, {s} is replaced by display name
				popup: !$scope.hasClass("popup-none"), // True to have it popup on demand, false to show always
				popupText: pe.dic.get('%share-text'), // Text for the popup trigger
				hideText: (pe.dic.get('%hide') + " - "), // Text to prepend to the popup trigger when popup is open
				addFavorite: $scope.hasClass("favourite"),  // True to add a 'add to favourites' link, false for none
				favoriteText: pe.dic.get('%favourite'),  // Display name for the favourites link
				addEmail: $scope.hasClass("email"),  // True to add a 'e-mail a friend' link, false for none
				emailText: pe.dic.get('%email'),  // Display name for the e-mail link
				emailSubject: pe.dic.get('%share-email-subject'),  // The subject for the e-mail
				emailBody: pe.dic.get('%share-email-body'), // The body of the e-mail,
					// use '{t}' for the position of the page title, '{u}' for the page URL,
					// '{d}' for the description, and '\n' for new lines
				manualBookmark: pe.dic.get('%share-manual'), // Instructions for manually bookmarking the page
				addShowAll: $scope.hasClass("showall"), // True to show listed sites first, then all on demand
				showAllText: pe.dic.get('%share-showall'), // Display name for show all link, use '{n}' for the number of sites
				showAllTitle: pe.dic.get('%share-showall-title'), // Title for show all popup
				addAnalytics: $scope.hasClass('analytics'), // True to include Google Analytics for links
				analyticsName: '/share/{r}/{s}' // The "URL" that is passed to the Google Analytics,
					// use '{s}' for the site code, '{n}' for the site name,
					// '{u}' for the current full URL, '{r}' for the current relative URL,
					// or '{t}' for the current title
			};
			
			// Extend the defaults with settings passed through settings.js (wet_boew_share) and the data attribute
			$.metadata.setType("attr", "data")
			if (typeof wet_boew_share !== 'undefined' && wet_boew_share !== null) {
				$.extend(opts, wet_boew_share, $scope.metadata());
			} else {
				$.extend(opts, $scope.metadata());
			}
			
			$scope.bookmark(opts);
			$popup = $scope.find('.bookmark_popup').append($scope.find('.bookmark_popup_text').clone().addClass('alt')).attr('id', 'bookmark_popup').attr('aria-hidden', 'true').prepend('<p class="popup_title">' + pe.dic.get('%share-statement') + '</p>');
			$popupText = $scope.find('.bookmark_popup_text').off('click');
			$popupText.attr('role', 'button').attr('aria-controls', 'bookmark_popup').attr('aria-pressed', 'false').on("click keydown", function (e) {
				if (e.type === "click" || (e.type === "keydown" && !(e.ctrlKey || e.altKey || e.metaKey) && ((e.keyCode === 9 && $(e.target).hasClass('alt')) || e.keyCode === 13 || e.keyCode === 32))) {
					if ($(e.target).attr('aria-pressed') === 'false') {
						$popup.trigger("open");
					} else {
						$popup.trigger("close");
					}
					if (e.keyCode !== 9) {
						return false;
					}
				}
			});
			$popup.on("keydown open close", function (e) {
				if (e.type === "keydown" && e.keyCode === 27) {
					$popup.trigger("close");
				} else if (e.type === "open") {
					$popupText.text(opts.hideText + opts.popupText).attr('aria-pressed', 'true');
					$popup.show().attr('aria-hidden', 'false');
				} else if (e.type === "close") {
					pe.focus($popupText.text(opts.popupText).attr('aria-pressed', 'false').eq(0));
					$popup.hide().attr('aria-hidden', 'true');
				}
			});
			$(document).on("click", function (e) {
				if ($popup.attr('aria-hidden') === 'false') {
					$popup.trigger("close");
				}
			});
			return $scope;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}
(jQuery));
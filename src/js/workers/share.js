/*!
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
/*
 * Share widget plugin
 */
/*global jQuery: false, pe:false */
(function ($) {
	var _pe = window.pe || {
		fn : {}
	};
	/* local reference */
	_pe.fn.share = {
		type : 'plugin',
		depends : ['bookmark'],
		_exec : function (elm) {
			var $scope = $(elm), opts, $popup;
			opts = { // See bookmark.js for details
				url: $scope.attr('data-url') ? $scope.attr('data-url') : '',
				sourceTag: $scope.attr('data-source-tag') ? $scope.attr('data-source-tag') : '',
				title: $scope.attr('data-title') ? $scope.attr('data-title') : '',
				description: $scope.attr('data-description') ? $scope.attr('data-description') : '',
				sites: [], /* Populate through data-* or something similar */
				iconsStyle: $scope.hasClass("icons-none") ? '' : 'bookmark_icons',
				icons: $scope.hasClass("icons-none") ? '' : 'bookmarks.png', // How should this image be handled/reference?
				compact : $scope.hasClass("compact"),
				hint : pe.dic.get('%share-hint'),
				popup : !$scope.hasClass("popup-none"),
				popupText : pe.dic.get('%share-text'),
				hideText : (pe.dic.get('%hide') + " - "),
				addFavorite : $scope.hasClass("favourite"),
				favoriteText : pe.dic.get('%favourite'),
				addEmail : $scope.hasClass("email"),
				emailText : pe.dic.get('%email'),
				emailSubject : pe.dic.get('%share-email-subject'),
				emailBody : pe.dic.get('%share-email-body'),
				manualBookmark : pe.dic.get('%share-manual'),
				addShowAll: $scope.hasClass("showall"),
				showAllText: 'Show all ({n})',
				showAllTitle: 'All bookmarking sites',
				addAnalytics : $scope.hasClass('analytics'),
				analyticsName: $scope.attr('data-analytics-name') ? $scope.attr('data-analytics-name') : '/share/{r}/{s}'
			};
			$scope.bookmark(opts);
			$scope.find('.bookmark_popup_text').attr('role', 'button').attr('aria-controls', 'bookmark_popup').attr('aria-pressed', 'false').on("click keydown focusout", function (e) {
				$popup = $scope.find('.bookmark_popup');
				if (e.type === "click" && $(e.target).attr('aria-pressed') === 'false') {
					$(e.target).text(opts.hideText + opts.popupText).attr('aria-pressed', 'true');
					$popup.show().attr('aria-hidden', 'false');
				} else if (e.type === "click" || (e.type === "keydown" && e.keyCode === 27) || e.type === "focusout") {
					$(e.target).text(opts.popupText).attr('aria-pressed', 'false');
					$popup.hide().attr('aria-hidden', 'true');
				}
				//$popup.css('center', $scope.offset().left).css('middle', $scope.offset().top + $scope.outerHeight()).toggle();
				return false;
			});
			$scope.find('bookmark_popup').attr('id', 'bookmark_popup').attr('aria-hidden', 'true').append('<p class="popup_title">' + pe.dic.get('%share-statement') + '</p>');
			return $scope;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}
(jQuery));
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
			var $scope = $(elm), opts, $popup, $popupText;
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
			$popup = $scope.find('.bookmark_popup').append($scope.find('.bookmark_popup_text').clone().css('float', 'right').css('margin', '5px')).attr('id', 'bookmark_popup').attr('aria-hidden', 'true').prepend('<p class="popup_title">' + pe.dic.get('%share-statement') + '</p>');
			$popupText = $scope.find('.bookmark_popup_text').off('click');
			$popupText.attr('role', 'button').attr('aria-controls', 'bookmark_popup').attr('aria-pressed', 'false').on("click keydown", function (e) {
				if (e.type === "click" || (e.type === "keydown" && !(e.ctrlKey || e.altKey || e.metaKey) && (e.keyCode === 13 || e.keyCode === 32))) {
					if ($(e.target).attr('aria-pressed') === 'false') {
						$popup.trigger("open");
					} else {
						$popup.trigger("close");
					}
					return false;
				}
			});
			$popup.on("keydown open close", function (e) {
				if (e.type === "keydown") {
					if (!(e.ctrlKey || e.altKey || e.metaKey)) {
						switch (e.keyCode) {
						case 27: // escape key
							$popup.trigger("close");
							return false;
						/*case 37: // left arrow
							_elm.trigger('section-previous');
							return false;
						case 38: // up arrow
							_elm.trigger('item-previous');
							return false;
						case 39: // right arrow
							_elm.trigger('section-next');
							return false;
						case 40: // down arrow
							_elm.trigger('item-next');
							return false;*/
						}
					}
				} else if (e.type === "open") {
					$popupText.text(opts.hideText + opts.popupText).attr('aria-pressed', 'true');
					$popup.show().attr('aria-hidden', 'false');
				} else if (e.type === "close") {
					pe.focus($popupText.text(opts.popupText).attr('aria-pressed', 'false').eq(0));
					$popup.hide().attr('aria-hidden', 'true');
				}
				//$popup.css('center', $scope.offset().left).css('middle', $scope.offset().top + $scope.outerHeight()).toggle();
			});
			$(document).on("click", function (e) {
				$popup.trigger("close");
			});
			return $scope;
		} // end of exec
	};
	window.pe = _pe;
	return _pe;
}
(jQuery));
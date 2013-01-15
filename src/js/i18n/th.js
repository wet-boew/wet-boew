/*!
 *
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 *
 * Version: @wet-boew-build.version@
 *
 */
/*
----- Thai dictionary (il8n) ---
 */
/*global jQuery: false, pe: false */
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	};
	_pe.dic.ind = {
		'%all': 'All',
		'%home': 'Home',
		'%main-page': 'Main page',
		'%top-of-page': 'Top of Page',
		'%you-are-in': 'You are in: ',
		'%welcome-to': 'Welcome to: ',
		'%loading': 'loading...',
		'%search': 'Search',
		'%search-for-terms': 'Search for term(s):',
		'%no-match-found': 'No match found',
		'%matches-found': {
			'mixin': '[MIXIN] match(es) found'
		},
		'%menu': 'Menu',
		'%hide': 'Hide',
		'%error': 'Error',
		'%colon': ':',
		'%start': 'Start',
		'%stop': 'Stop',
		'%back': 'Back',
		'%new-window': ' (Opens in a new window)',
		'%minute-ago': 'a minute ago',
		'%couple-of-minutes': 'couple of minutes ago',
		'%minutes-ago': {
			'mixin': '[MIXIN] minutes ago'
		},
		'%hour-ago': 'an hour ago',
		'%hours-ago': {
			'mixin': '[MIXIN] hours ago'
		},
		'%days-ago': {
			'mixin': '[MIXIN] days ago'
		},
		'%yesterday': 'yesterday',

		'%next': 'Next',
		'%previous': 'Previous',

		/* Archived Web page template */
		'%archived-page': 'This Web page has been archived on the Web.',
		/* Menu bar */
		'%sub-menu-help': '(open the submenu with the enter key and close with the escape key)',
		/* Tabbed interface */
		'%tab-rotation': {
			'disable': 'Stop tab rotation',
			'enable': 'Start tab rotation'
		},
		'%tab-list': 'Tab list',
		/* Multimedia player */
		'%play': 'Play',
		'%pause': 'Pause',
		'%open': 'Open',
		'%close': 'Close',
		'%rewind': 'Rewind',
		'%fast-forward': 'Fast forward ',
		'%mute': {
			'enable': 'Mute',
			'disable': 'Unmute'
		},
		'%closed-caption': {
			'disable': 'Hide Closed captioning',
			'enable': 'Show Closed captioning'
		},
		'%captionserror': 'Error loading closed captions',
		'%audio-description': {
			'enable': 'Enable Audio Description',
			'disable': 'Disable Audio Description'
		},
		'%progress-bar': 'use LEFT ARROW and RIGHT ARROW keys to advance and rewind the media\'s progress',
		'%no-video': 'Your browser does not appear to have the capabilities to play this video, please download the video below',
		'%position': 'Current Position: ',
		'%percentage': 'Playback Percentage: ',
		'%duration': 'Total Time: ',
		'%buffered': 'Buffered: ',
		/* Share widget */
		'%favourite': 'Favourite',
		'%email': 'Email',
		'%share-text': 'Share this page',
		'%share-hint': ' with {s}',
		'%share-email-subject': 'Interesting page',
		'%share-email-body': 'I thought you might find this page interesting:\n{t} ({u})',
		'%share-fav-title': ' (bookmark this page)',
		'%share-manual': 'Please close this dialog and\npress Ctrl-D to bookmark this page.',
		'%share-showall': 'Show all ({n})',
		'%share-showall-title': 'All bookmarking sites',
		'%share-disclaimer' : 'No endorsement of any products or services is expressed or implied.',
		/* Form validation */
		'%form-not-submitted': 'The form could not be submitted because ',
		'%errors-found': ' errors were found.',
		'%error-found': ' error was found.',
		/* Date picker */
		'%datepicker-hide': 'Hide Calendar',
		'%datepicker-show': 'Pick a date from a calendar for field: ',
		'%datepicker-selected': 'Selected',
		/* Calendar */
		'%calendar-weekDayNames': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
		'%calendar-monthNames': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
		'%calendar-currentDay': ' (Current Day)',
		'%calendar-goToLink': 'Go To<span class="wb-invisible"> Month of Year</span>',
		'%calendar-goToTitle': 'Go To Month of Year',
		'%calendar-goToMonth': 'Month:',
		'%calendar-goToYear': 'Year:',
		'%calendar-goToButton': 'Go',
		'%calendar-cancelButton': 'Cancel',
		'%calendar-previousMonth': 'Previous Month: ',
		'%calendar-nextMonth': 'Next Month: ',
		/* Slideout */
		'%show-toc': 'Show',
		'%show-image': 'show.png',
		'%hide-image': 'hide.png',
		'%table-contents': ' table of contents',
		/* Lightbox */
		'%lb-current': 'Item {current} of {total}',
		'%lb-next': 'Next item',
		'%lb-prev': 'Previous item',
		'%lb-xhr-error': 'This content failed to load.',
		'%lb-img-error': 'This image failed to load.',
		'%lb-slideshow': 'slideshow',
		/* jQuery Mobile */
		'%jqm-expand': ' click to expand contents',
		'%jqm-collapse': ' click to collapse contents',
		'%jqm-clear-search': 'clear search',
		'%jqm-filter': 'Filter items...',
		/* Charts widget */
		'%table-mention': 'Table',
		'%table-following': 'Chart. Details in the following table.',
		/* Session timeout */
		'%st-timeout-msg': 'Your session is about to expire, you have until #expireTime# to activate the "OK" button below to extend your session.',
		'%st-msgbox-title': 'Session timeout warning',
		'%st-already-timeout-msg': 'Sorry your session has already expired. Please login again.',
		/* Toggle details */
		'%td-toggle': 'Toggle all',
		'%td-open': 'Expand all',
		'%td-close': 'Collapse all',
		'%td-ttl-open': 'Expand all sections of content',
		'%td-ttl-close': 'Collapse all sections of content',
		/* Disable/enable PE */
		'%pe-disable': 'Basic HTML version',
		'%pe-enable': 'Standard version'
	};
	$(document).trigger('languageloaded');
	window.pe = _pe;
	return _pe;
}(jQuery));

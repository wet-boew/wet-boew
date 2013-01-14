/*!
 *
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 *
 * Version: @wet-boew-build.version@
 *
 */
/*
----- @%lang-eng@ dictionary (il8n) ---
 */
/*global jQuery: false, pe: false */
/*jshint bitwise: false */
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	};
	_pe.dic = {
		get: function (key, state, mixin) {
			var truthiness = (typeof key === 'string' && key !== '') | // eg. 000 or 001 ie. 0 or 1
				(typeof state === 'string' && state !== '') << 1 | // eg. 000 or 010 ie. 0 or 2
				(typeof mixin === 'string' && mixin !== '') << 2; // eg. 000 or 100 ie. 0 or 4
			switch (truthiness) {
				case 1:
					return this.ind[key]; // only key was provided.
				case 3:
					return this.ind[key][state]; // key and state were provided.
				case 7:
					return this.ind[key][state].replace('[MIXIN]', mixin); // key, state, and mixin were provided.
				default:
					return '';
			}
		},
		/*
		@dictionary function : pe.dic.ago()
		@returns: a human readable time difference text
		*/
		ago: function (time_value) {
			var delta,
				parsed_date,
				r,
				relative_to;
			parsed_date = pe.date.convert(time_value);
			relative_to = (arguments.length > 1 ? arguments[1] : new Date());
			delta = parseInt((relative_to.getTime() - parsed_date) / 1000, 10);
			delta = delta + (relative_to.getTimezoneOffset() * 60);
			r = '';
			if (delta < 60) {
				r = this.get('%minute-ago');
			} else if (delta < 120) {
				r = this.get('%couple-of-minutes');
			} else if (delta < (45 * 60)) {
				r = this.get('%minutes-ago', 'mixin', (parseInt(delta / 60, 10)).toString());
			} else if (delta < (90 * 60)) {
				r = this.get('%hour-ago');
			} else if (delta < (24 * 60 * 60)) {
				r = this.get('%hours-ago', 'mixin', (parseInt(delta / 3600, 10)).toString());
			} else if (delta < (48 * 60 * 60)) {
				r = this.get('%yesterday');
			} else {
				r = this.get('%days-ago', 'mixin', (parseInt(delta / 86400, 10)).toString());
			}
			return r;
		},
		ind: {
			'%all': '@%all@',
			'%home': '@%home@',
			'%main-page': '@%main-page@',
			'%top-of-page': '@%top-of-page@',
			'%you-are-in': '@%you-are-in@',
			'%welcome-to': '@%welcome-to@',
			'%loading': '@%loading@',
			'%search': '@%search@',
			'%search-for-terms': '@%search-for-terms@',
			'%no-match-found': '@%no-match-found@',
			'%matches-found': {
				'mixin': '@%matches-found@'
			},
			'%menu': '@%menu@',
			'%hide': '@%hide@',
			'%error': '@%error@',
			'%colon': '@%colon@',
			'%start': '@%start@',
			'%stop': '@%stop@',
			'%back': '@%back@',
			'%new-window': '@%new-window@',
			'%minute-ago': '@%minute-ago@',
			'%couple-of-minutes': '@%couple-of-minutes@',
			'%minutes-ago': {
				'mixin': '@%minutes-ago@'
			},
			'%hour-ago': '@%hour-ago@',
			'%hours-ago': {
				'mixin': '@%hours-ago@'
			},
			'%days-ago': {
				'mixin': '@%days-ago@'
			},
			'%yesterday': '@%yesterday@',
			
			'%next': '@%next@',
			'%previous': '@%previous@',
			
			/* Archived Web page template */
			'%archived-page': '@%archived-page@',
			/* Menu bar */
			'%sub-menu-help': '@%sub-menu-help@',
			/* Tabbed interface */
			'%tab-rotation': {
				'disable': '@%tab-rotation-disable@',
				'enable': '@%tab-rotation-enable@'
			},
			'%tab-list': '@%tab-list@',
			/* Multimedia player */
			'%play': '@%play@',
			'%pause': '@%pause@',
			'%close': '@%close@',
			'%rewind': '@%rewind@',
			'%fast-forward': '@%fast-forward@',
			'%mute': {
				'enable': '@%mute-enable@',
				'disable': '@%mute-disable@'
			},
			'%closed-caption': {
				'disable': '@%closed-caption-disable@',
				'enable': '@%closed-caption-enable@'
			},
			'%captionserror': '@%captionserror@',
			'%audio-description': {
				'enable': '@%audio-description-enable@',
				'disable': '@%audio-description-disable@'
			},
			'%progress-bar': '@%progress-bar@',
			'%no-video': '@%no-video@',
			'%position': '@%position@',
			'%percentage': '@%percentage@',
			'%duration': '@%duration@',
			'%buffered': '@%buffered@',
			/* Share widget */
			'%favourite': '@%favourite@',
			'%email': '@%email@',
			'%share-text': '@%share-text@',
			'%share-hint': '@%share-hint@',
			'%share-email-subject': '@%share-email-subject@',
			'%share-email-body': '@%share-email-body@',
			'%share-fav-title': '@%share-fav-title@',
			'%share-manual': '@%share-manual@',
			'%share-showall': '@%share-showall@',
			'%share-showall-title': '@%share-showall-title@',
			'%share-disclaimer' : '@%share-disclaimer@',
			/* Form validation */
			'%form-not-submitted': '@%form-not-submitted@',
			'%errors-found': '@%errors-found@',
			'%error-found': '@%error-found@',
			/* Date picker */
			'%datepicker-hide': '@%datepicker-hide@',
			'%datepicker-show': '@%date-picker-show@',
			'%datepicker-selected': '@%datepicker-selected@',
			/* Calendar */
			'%calendar-weekDayNames': ['@%calendar-weekDayNames-1@', '@%calendar-weekDayNames-2@', '@%calendar-weekDayNames-3@', '@%calendar-weekDayNames-4@', '@%calendar-weekDayNames-5@', '@%calendar-weekDayNames-6@', '@%calendar-weekDayNames-7@'],
			'%calendar-monthNames': ['@%calendar-monthNames-1@', '@%calendar-monthNames-2@', '@%calendar-monthNames-3@', '@%calendar-monthNames-4@', '@%calendar-monthNames-5@', '@%calendar-monthNames-6@', '@%calendar-monthNames-7@', '@%calendar-monthNames-8@', '@%calendar-monthNames-9@', '@%calendar-monthNames-10@', '@%calendar-monthNames-11@', '@%calendar-monthNames-12@'],
			'%calendar-currentDay': '@%calendar-currentDay@',
			'%calendar-goToLink': '@%calendar-goToLink@',
			'%calendar-goToTitle': '@%calendar-goToTitle@',
			'%calendar-goToMonth': '@%calendar-goToMonth@',
			'%calendar-goToYear': '@%calendar-goToYear@',
			'%calendar-goToButton': '@%calendar-goToButton@',
			'%calendar-cancelButton': '@%calendar-cancelButton@',
			'%calendar-previousMonth': '@%calendar-previousMonth@',
			'%calendar-nextMonth': '@%calendar-nextMonth@',
			/* Slideout */
			'%show-toc': '@%show-toc@',
			'%show-image': '@%show-image@',
			'%hide-image': '@%hide-image@',
			'%show-text': '@%show-text@',
			'%hide-text': '@%hide-text@',
			'%table-contents': '@%table-contents@',
			/* Lightbox */
			'%lb-current': '@%lb-current@',
			'%lb-next': '@%lb-next@',
			'%lb-prev': '@%lb-prev@',
			'%lb-xhr-error': '@%xhr-error@',
			'%lb-img-error': '@%lb-img-error@',
			'%lb-slideshow': '@%lb-slideshow@',
			/* jQuery Mobile */
			'%jqm-expand': '@%jqm-expand@',
			'%jqm-collapse': '@%jqm-collapse@',
			'%jqm-clear-search': '@%jqm-clear-search@',
			'%jqm-filter': '@%jqm-filter@',
			/* Charts widget */
			'%table-mention': '@%table-mention@',
			'%table-following': '@%table-following@',
			/* Session timeout */
			'%st-timeout-msg': '@%st-timeout-msg@',
			'%st-msgbox-title': '@%st-msgbox-title@',
			'%st-already-timeout-msg': '@st-already-timeout-msg@',
			/* Disable/enable PE */
			'%pe-disable': '@%pe-disable@',
			'%pe-enable': '@%pe-enable@'
		}
	};
	$(document).trigger('languageloaded');
	window.pe = _pe;
	return _pe;
}(jQuery));
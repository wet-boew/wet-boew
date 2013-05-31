/*!
 *
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-eng.txt / wet-boew.github.io/wet-boew/Licence-fra.txt
 *
 * Version: @wet-boew-build.version@
 *
 */
/*
----- @%lang-eng@ dictionary (il8n) ---
 */
/*global jQuery: false */
(function ($) {
	"use strict";
	var _pe = window.pe || {
		fn: {}
	};
	_pe.dic.ind = {
		'%lang-code': '@%lang-code@',
		'%lang-eng': '@%lang-eng@',
		'%lang-fra': '@%lang-fra@',
		'%lang-native': '@%lang-native@',
		'%all': '@%all@',
		'%home': '@%home@',
		'%main-page': '@%main-page@',
		'%top-of-page': '@%top-of-page@',
		'%you-are-in': '@%you-are-in@',
		'%welcome-to': '@%welcome-to@',
		'%loading': '@%loading@',
		'%processing': '@%processing@',
		'%search': '@%search@',
		'%search-for-terms': '@%search-for-terms@',
		'%no-match-found': '@%no-match-found@',
		'%matches-found': {
			'mixin': '@%matches-found@'
		},
		'%menu': '@%menu@',
		'%settings': '@%settings@',
		'%languages': '@%languages@',
		'%about': '@%about@',
		'%current': '@%current@',
		'%hide': '@%hide@',
		'%error': '@%error@',
		'%colon': '@%colon@',
		'%hyphen': '@%hyphen@',
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
		'%first': '@%first@',
		'%last': '@%last@',

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
		'%tab-panel-end-1': '@%tab-panel-end-1@',
		'%tab-panel-end-2': '@%tab-panel-end-2@',
		'%tab-panel-end-3': '@%tab-panel-end-3@',
		/* Multimedia player */
		'%play': '@%play@',
		'%pause': '@%pause@',
		'%open': '@%open@',
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
		'%closed-caption-error': '@%closed-caption-error@',
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
		'%datepicker-show': '@%datepicker-show@',
		'%datepicker-selected': '@%datepicker-selected@',
		/* Calendar */
		'%calendar-weekDayNames': ['@%calendar-weekDayNames-1@', '@%calendar-weekDayNames-2@', '@%calendar-weekDayNames-3@', '@%calendar-weekDayNames-4@', '@%calendar-weekDayNames-5@', '@%calendar-weekDayNames-6@', '@%calendar-weekDayNames-7@'],
		'%calendar-monthNames': ['@%calendar-monthNames-1@', '@%calendar-monthNames-2@', '@%calendar-monthNames-3@', '@%calendar-monthNames-4@', '@%calendar-monthNames-5@', '@%calendar-monthNames-6@', '@%calendar-monthNames-7@', '@%calendar-monthNames-8@', '@%calendar-monthNames-9@', '@%calendar-monthNames-10@', '@%calendar-monthNames-11@', '@%calendar-monthNames-12@'],
		'%calendar': '@%calendar@',
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
		'%show-text': '@%show-text@',
		'%hide-text': '@%hide-text@',
		'%table-contents': '@%table-contents@',
		/* Lightbox */
		'%lb-current': '@%lb-current@',
		'%lb-next': '@%lb-next@',
		'%lb-prev': '@%lb-prev@',
		'%lb-xhr-error': '@%lb-xhr-error@',
		'%lb-img-error': '@%lb-img-error@',
		'%lb-slideshow': '@%lb-slideshow@',
		/* jQuery Mobile */
		'%jqm-expand': '@%jqm-expand@',
		'%jqm-collapse': '@%jqm-collapse@',
		'%jqm-clear-search': '@%jqm-clear-search@',
		'%jqm-filter': '@%jqm-filter@',
		'%jqm-tbl-col-toggle': '@%jqm-tbl-col-toggle@',
		/* Charts widget */
		'%table-mention': '@%table-mention@',
		'%table-following': '@%table-following@',
		/* Session timeout */
		'%st-timeout-msg': '@%st-timeout-msg@',
		'%st-msgbox-title': '@%st-msgbox-title@',
		'%st-already-timeout-msg': '@%st-already-timeout-msg@',
		/* Toggle details */
		'%td-toggle': '@%td-toggle@',
		'%td-open': '@%td-open@',
		'%td-close': '@%td-close@',
		'%td-ttl-open': '@%td-ttl-open@',
		'%td-ttl-close': '@%td-ttl-close@',
		/* Table enhancement */
		'%sSortAscending': '@%sSortAscending@',
		'%sSortDescending': '@%sSortDescending@',
		'%sEmptyTable': '@%sEmptyTable@',
		'%sInfo': '@%sInfo@',
		'%sInfoEmpty': '@%sInfoEmpty@',
		'%sInfoFiltered': '@%sInfoFiltered@',
		'%sInfoThousands': '@%sInfoThousands@',
		'%sLengthMenu': '@%sLengthMenu@',
		/* Geomap */
		'%geo-mapcontrol': '@%geo-mapcontrol@',
		'%geo-panup': '@%geo-panup@',
		'%geo-pandown': '@%geo-pandown@',
		'%geo-panleft': '@%geo-panleft@',
		'%geo-panright': '@%geo-panright@',
		'%geo-zoomin': '@%geo-zoomin@',
		'%geo-zoomout': '@%geo-zoomout@',
		'%geo-zoomworld': '@%geo-zoomworld@',
		'%geo-zoomslider': '@%geo-zoomslider@',
		'%geo-zoomfeature': '@%geo-zoomfeature@',
		'%geo-scaleline': '@%geo-scaleline@',
		'%geo-mouseposition': '@%geo-mouseposition@',
		'%geo-ariamap': '@%geo-ariamap@',
		'%geo-accessibilize': '@%geo-accessibilize@',
		'%geo-accessibilizetitle': '@%geo-accessibilizetitle@',
		'%geo-togglelayer': '@%geo-togglelayer@',
		'%geo-hiddenlayer': '@%geo-hiddenlayer@',
		'%geo-basemapurl': '@%geo-basemapurl@',
		'%geo-basemaptitle': '@%geo-basemaptitle@',
		'%geo-select': '@%geo-select@',
		'%geo-labelselect': '@%geo-labelselect@',
		/* Disable/enable PE */
		'%pe-disable': '@%pe-disable@',
		'%pe-enable': '@%pe-enable@'
	};
	_pe.document.trigger('languageloaded');
	window.pe = _pe;
	return _pe;
}(jQuery));

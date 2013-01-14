/*!
 *
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 *
 * Version: @wet-boew-build.version@
 *
 */
/*
----- Estonian dictionary (il8n) ---
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
			'%all': 'Kõik',
			'%home': 'Kodu',
			'%main-page': 'Main page',
			'%top-of-page': 'Lehekülje algusesse',
			'%you-are-in': 'Te olete ',
			'%welcome-to': 'Tere tulemast ',
			'%loading': 'laeb...',
			'%search': 'Otsi',
			'%search-for-terms': 'Otsi väjendit',
			'%no-match-found': 'Vastet ei leitud',
			'%matches-found': {
				'mixin': '[MIXIN] vaste leitud'
			},
			'%menu': 'Menüü',
			'%hide': 'Peida',
			'%error': 'Viga',
			'%colon': ':',
			'%start': 'Alusta',
			'%stop': 'Lõpeta',
			'%back': 'Tagasi',
			'%new-window': ' (avaneb uues aknas)',
			'%minute-ago': 'minut tagasi',
			'%couple-of-minutes': 'mõned minutid tagasi',
			'%minutes-ago': {
				'mixin': '[MIXIN] minutit tagasi'
			},
			'%hour-ago': 'tund aega tagasi',
			'%hours-ago': {
				'mixin': '[MIXIN] tundi tagasi'
			},
			'%days-ago': {
				'mixin': '[MIXIN] päeva tagasi'
			},
			'%yesterday': 'eile',
			
			'%next': 'Järgmine',
			'%previous': 'Eelmine',
			
			/* Archived Web page template */
			'%archived-page': 'See veebileht on arhiveeritud',
			/* Menu bar */
			'%sub-menu-help': '(ava alamenüü sisene klahviga ja sulge escape klahviga)',
			/* Tabbed interface */
			'%tab-rotation': {
				'disable': 'Seiska rotatsioon',
				'enable': 'Alusta rotatsiooni'
			},
			'%tab-list': 'Tab list',
			/* Multimedia player */
			'%play': 'Mängi',
			'%pause': 'Paus',
			'%open': 'Open',
			'%close': 'Sulge',
			'%rewind': 'Tagasi',
			'%fast-forward': 'Kiirelt edasi ',
			'%mute': {
				'enable': 'Vaigista',
				'disable': 'Heli tagasi'
			},
			'%closed-caption': {
				'disable': 'Peida subtiitrid',
				'enable': 'Näita subtiitreid'
			},
			'%captionserror': 'Viga subtiitrite avamisel',
			'%audio-description': {
				'enable': 'Luba audio kirjeldus',
				'disable': 'Sulge audio kirjeldus'
			},
			'%progress-bar': 'Kasuta vasakut nooleklahvi ja paremat nooleklahvi edasi ja tagasi liikumiseks',
			'%no-video': 'Sinu brauser ei võimalda mängida seda videot, palun lae video alla',
			'%position': 'Hetke asukoht ',
			'%percentage': 'Playback Percentage: ',
			'%duration': 'Kogu kestvus: ',
			'%buffered': 'Puhverdatud ',
			/* Share widget */
			'%favourite': 'Lemmik',
			'%email': 'E-postl',
			'%share-text': 'Jaga seda lehekülge',
			'%share-hint': ' koos {s}',
			'%share-email-subject': 'Huvitav lehekülg',
			'%share-email-body': 'Ma arvasin, et sa leiad selle lehekülje huvitava olevat:\n{t} ({u})',
			'%share-fav-title': ' (bookmark this page)',
			'%share-manual': 'Palun sule see akne ja vajuta Ctrl-D märgistamaks seda lehekülge',
			'%share-showall': 'Näita kõiki ({n})',
			'%share-showall-title': 'Kõik märgitud leheküljed',
			'%share-disclaimer' : 'No endorsement of any products or services is expressed or implied.',
			/* Form validation */
			'%form-not-submitted': 'Ankeeti ei saa esitada kuna ',
			'%errors-found': ' vead leitud',
			'%error-found': ' viga leitud',
			/* Date picker */
			'%datepicker-hide': 'Peida kalender',
			'%datepicker-show': 'Vali kuupäev kalendrist ',
			'%datepicker-selected': 'Valitud',
			/* Calendar */
			'%calendar-weekDayNames': ['Pühapäev', 'Esmaspäev', 'Teisipäev', 'Kolmapäev', 'Neljapäev', 'Reede', 'Laupäev'],
			'%calendar-monthNames': ['Jaanuar', 'Veebruar', 'Märts', 'Aprill', 'Mai', 'Juuni', 'Juuli', 'August', 'September', 'Oktoober', 'November', 'Detsember'],
			'%calendar-currentDay': ' (tänane päev)',
			'%calendar-goToLink': 'Go To<span class="wb-invisible"> Month of Year</span>',
			'%calendar-goToTitle': 'Mine sellele kuule aastas',
			'%calendar-goToMonth': 'Kuu',
			'%calendar-goToYear': 'Aasta',
			'%calendar-goToButton': 'Mine',
			'%calendar-cancelButton': 'Tühista',
			'%calendar-previousMonth': 'Eelmine kuu ',
			'%calendar-nextMonth': 'Järgmine kuu ',
			/* Slideout */
			'%show-toc': 'Näita',
			'%show-image': 'show.png',
			'%hide-image': 'hide.png',
			'%table-contents': ' sisukord',
			/* Lightbox */
			'%lb-current': 'Nimetus {current} kogu {total}',
			'%lb-next': 'Järgmine',
			'%lb-prev': 'Eelmine',
			'%lb-xhr-error': 'Laadimine ebaõnnestus',
			'%lb-img-error': 'Pildi laadimine ebaõnnestus',
			'%lb-slideshow': 'slaidi esitlus',
			/* jQuery Mobile */
			'%jqm-expand': ' vajuta, et laiendada sisu',
			'%jqm-collapse': ' vajuta, et kitsenada sisu',
			'%jqm-clear-search': 'tühista otsing',
			'%jqm-filter': 'Filtreeri',
			/* Charts widget */
			'%table-mention': 'Tabel',
			'%table-following': 'Graafik. Andmed tabelis järgmised',
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
			'%pe-disable': 'Lihtsustatud HTML versioon',
			'%pe-enable': 'Standardversioon'
		}
	};
	$(document).trigger('languageloaded');
	window.pe = _pe;
	return _pe;
}(jQuery));

/*!
 *
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.com/wet-boew/License-eng.txt / wet-boew.github.com/wet-boew/Licence-fra.txt
 *
 * Version: @wet-boew-build.version@
 *
 */
/*
----- Dutch dictionary (il8n) ---
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
			'%all': 'Allen',
			'%home': 'Home',
			'%main-page': 'Main page',
			'%top-of-page': 'Bovenkant pagina',
			'%you-are-in': 'U bent hier:  ',
			'%welcome-to': 'Welkom bij: ' + $('#gcwu-title').text(),
			'%loading': 'aan het laden..',
			'%search': 'Zoek',
			'%search-for-terms': 'Zoekwoord(en):',
			'%no-match-found': 'Er zijn geen resultaten met deze zoekterm(en)',
			'%matches-found': {
				'mixin': '[MIXIN] gevonden zoekresultaten'
			},
			'%menu': 'Menu',
			'%hide': 'Verberg',
			'%error': 'Fout',
			'%colon': ':',
			'%start': 'Start',
			'%stop': 'Stop',
			'%back': 'Terug',
			'%new-window': ' (Opent in een nieuw venster)',
			'%minute-ago': 'Een minuut geleden',
			'%couple-of-minutes': 'Enkele minuten geleden',
			'%minutes-ago': {
				'mixin': '[MIXIN] minuten geleden'
			},
			'%hour-ago': 'een uur geleden',
			'%hours-ago': {
				'mixin': '[MIXIN] uur geleden'
			},
			'%days-ago': {
				'mixin': '[MIXIN] dagen geleden'
			},
			'%yesterday': 'gisteren',
			
			'%next': 'Volgende',
			'%previous': 'Vorige',
			
			/* Archived Web page template */
			'%archived-page': 'Deze pagina is gearchiveerd',
			/* Menu bar */
			'%sub-menu-help': '(open het submenu via de Enter-toets en sluit het met de Escape-toets)',
			/* Tabbed interface */
			'%tab-rotation': {
				'disable': 'Stop de rotatie van de tabs',
				'enable': 'Start de rotatie van de tabs'
			},
			'%tab-list': 'Tab list',
			/* Multimedia player */
			'%play': 'Speel af',
			'%pause': 'Pause',
			'%open': 'Open',
			'%close': 'Sluit af',
			'%rewind': 'Keer terug',
			'%fast-forward': 'Snel vooruit ',
			'%mute': {
				'enable': 'Desactiveer geluid',
				'disable': 'Activeer geluid'
			},
			'%closed-caption': {
				'disable': 'Verberg ondertiteling',
				'enable': 'Toon ondertiteling'
			},
			'%captionserror': 'Fout bij het tonen van de ondertiteling',
			'%audio-description': {
				'enable': 'Activeer audio-beschrijving',
				'disable': 'Desactiveer audio-beschrijving'
			},
			'%progress-bar': 'gebruik LINKSE en RECHTSE pijlen om verder te gaan of terug te keren',
			'%no-video': 'Uw browser is blijkbaar niet in staat om deze video af te spelen; gelieve de video hieronder af te spelen',
			'%position': 'Huidige positie: ',
			'%percentage': 'Playback Percentage: ',
			'%duration': 'Totaaltijd: ',
			'%buffered': 'Gebufferd: ',
			/* Share widget */
			'%favourite': 'Favoriet',
			'%email': 'E-mail',
			'%share-text': 'Deel deze pagina met anderen',
			'%share-hint': ' with {s}',
			'%share-email-subject': 'Interessante pagina',
			'%share-email-body': 'Ik meende dat u deze pagina wellicht interessant vond:\n{t} ({u})',
			'%share-fav-title': ' (bookmark this page)',
			'%share-manual': 'Gelieve dit dialoogvenster te sluiten en met Ctrl-D te bookmarken',
			'%share-showall': 'Toon alle ({n})',
			'%share-showall-title': 'Alle bookmark sites',
			'%share-disclaimer' : 'No endorsement of any products or services is expressed or implied.',
			/* Form validation */
			'%form-not-submitted': 'Het formulier kon niet worden verwerkt omdat ',
			'%errors-found': ' er fouten zijn opgetreden.',
			'%error-found': ' er een fout is opgetreden.',
			/* Date picker */
			'%datepicker-hide': 'Verberg de kalender',
			'%datepicker-show': 'Kies een kalenderdatum voor het veld: ',
			'%datepicker-selected': 'Geselecteerd',
			/* Calendar */
			'%calendar-weekDayNames': ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'],
			'%calendar-monthNames': ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'],
			'%calendar-currentDay': ' (Vandaag)',
			'%calendar-goToLink': 'Go To<span class="wb-invisible"> Month of Year</span>',
			'%calendar-goToTitle': 'Ga naar de maand of het jaar',
			'%calendar-goToMonth': 'Maand:',
			'%calendar-goToYear': 'Jaar:',
			'%calendar-goToButton': 'Ga',
			'%calendar-cancelButton': 'Annuleer',
			'%calendar-previousMonth': 'Vorige maand: ',
			'%calendar-nextMonth': 'Volgende maand: ',
			/* Slideout */
			'%show-toc': 'Toon',
			'%show-image': 'show.png',
			'%hide-image': 'hide.png',
			'%table-contents': ' inhoudstafel',
			/* Lightbox */
			'%lb-current': 'Item {current} op een totaal van {total}',
			'%lb-next': 'Volgend artikel',
			'%lb-prev': 'Vorig artikel',
			'%lb-xhr-error': 'De inhoud is niet ingeladen',
			'%lb-img-error': 'Het beeld is niet ingeladen',
			'%lb-slideshow': 'diavoorstelling',
			/* jQuery Mobile */
			'%jqm-expand': ' klik om de inhoud te tonen',
			'%jqm-collapse': ' klik om de inhoud te verbergen',
			'%jqm-clear-search': 'verwijder de opzoeking',
			'%jqm-filter': 'Filter de artikelen',
			/* Charts widget */
			'%table-mention': 'Tabel',
			'%table-following': 'Grafiek. Meer details in volgende tabel ',
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
			'%pe-disable': 'Versie in basis-HTML',
			'%pe-enable': 'Standaardversie'
		}
	};
	$(document).trigger('languageloaded');
	window.pe = _pe;
	return _pe;
}(jQuery));

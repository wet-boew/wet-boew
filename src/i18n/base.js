/*
 * Web Experience Toolkit (WET) / Boîte à outils de l"expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */

//@TODO: Caching object to optimize lookups

/*
----- @%lang-eng@ dictionary (il8n) ---
 */
(function(window) {
"use strict";
/* main index */
var ind = {
	"%lang-code": "@%lang-code@",
	"%lang-eng": "@%lang-eng@",
	"%lang-fra": "@%lang-fra@",
	"%lang-native": "@%lang-native@",
	"%all": "@%all@",
	"%home": "@%home@",
	"%main-page": "@%main-page@",
	"%top-of-page": "@%top-of-page@",
	"%you-are-in": "@%you-are-in@",
	"%welcome-to": "@%welcome-to@",
	"%loading": "@%loading@",
	"%processing": "@%processing@",
	"%search": "@%search@",
	"%search-for-terms": "@%search-for-terms@",
	"%no-match-found": "@%no-match-found@",
	"%matches-found": {
		"mixin": "@%matches-found@"
	},
	"%menu": "@%menu@",
	"%settings": "@%settings@",
	"%languages": "@%languages@",
	"%about": "@%about@",
	"%current": "@%current@",
	"%hide": "@%hide@",
	"%error": "@%error@",
	"%colon": "@%colon@",
	"%hyphen": "@%hyphen@",
	"%full-stop": "@%full-stop@",
	"%list-comma-space": "@%list-comma-space@",
	"%interword-space": "@%interword-space@",
	"%start": "@%start@",
	"%stop": "@%stop@",
	"%back": "@%back@",
	"%new-window": "@%new-window@",
	"%minute-ago": "@%minute-ago@",
	"%couple-of-minutes": "@%couple-of-minutes@",
	"%minutes-ago": {
		"mixin": "@%minutes-ago@"
	},
	"%hour-ago": "@%hour-ago@",
	"%hours-ago": {
		"mixin": "@%hours-ago@"
	},
	"%days-ago": {
		"mixin": "@%days-ago@"
	},
	"%yesterday": "@%yesterday@",

	"%next": "@%next@",
	"%previous": "@%previous@",
	"%first": "@%first@",
	"%last": "@%last@",

	/* Archived Web page template */
	"%archived-page": "@%archived-page@",
	/* Menu bar */
	"%sub-menu-help": "@%sub-menu-help@",
	/* Tabbed interface */
	"%tab-rotation": {
		"disable": "@%tab-rotation-disable@",
		"enable": "@%tab-rotation-enable@"
	},
	"%tab-list": "@%tab-list@",
	"%tab-panel-end-1": "@%tab-panel-end-1@",
	"%tab-panel-end-2": "@%tab-panel-end-2@",
	"%tab-panel-end-3": "@%tab-panel-end-3@",
	/* Multimedia player */
	"%play": "@%play@",
	"%pause": "@%pause@",
	"%open": "@%open@",
	"%close": "@%close@",
	"%rewind": "@%rewind@",
	"%fast-forward": "@%fast-forward@",
	"%mute": {
		"enable": "@%mute-enable@",
		"disable": "@%mute-disable@"
	},
	"%closed-caption": {
		"disable": "@%closed-caption-disable@",
		"enable": "@%closed-caption-enable@"
	},
	"%closed-caption-error": "@%closed-caption-error@",
	"%audio-description": {
		"enable": "@%audio-description-enable@",
		"disable": "@%audio-description-disable@"
	},
	"%progress-bar": "@%progress-bar@",
	"%no-video": "@%no-video@",
	"%position": "@%position@",
	"%percentage": "@%percentage@",
	"%duration": "@%duration@",
	"%buffered": "@%buffered@",
	/* Share widget */
	"%favourite": "@%favourite@",
	"%email": "@%email@",
	"%share-text": "@%share-text@",
	"%share-hint": "@%share-hint@",
	"%share-email-subject": "@%share-email-subject@",
	"%share-email-body": "@%share-email-body@",
	"%share-fav-title": "@%share-fav-title@",
	"%share-manual": "@%share-manual@",
	"%share-showall": "@%share-showall@",
	"%share-showall-title": "@%share-showall-title@",
	"%share-disclaimer": "@%share-disclaimer@",
	/* Form validation */
	"%form-not-submitted": "@%form-not-submitted@",
	"%errors-found": "@%errors-found@",
	"%error-found": "@%error-found@",
	/* Date picker */
	"%datepicker-hide": "@%datepicker-hide@",
	"%datepicker-show": "@%datepicker-show@",
	"%datepicker-selected": "@%datepicker-selected@",
	/* Calendar */
	"%calendar-weekDayNames": ["@%calendar-weekDayNames-1@", "@%calendar-weekDayNames-2@", "@%calendar-weekDayNames-3@", "@%calendar-weekDayNames-4@", "@%calendar-weekDayNames-5@", "@%calendar-weekDayNames-6@", "@%calendar-weekDayNames-7@"],
	"%calendar-monthNames": ["@%calendar-monthNames-1@", "@%calendar-monthNames-2@", "@%calendar-monthNames-3@", "@%calendar-monthNames-4@", "@%calendar-monthNames-5@", "@%calendar-monthNames-6@", "@%calendar-monthNames-7@", "@%calendar-monthNames-8@", "@%calendar-monthNames-9@", "@%calendar-monthNames-10@", "@%calendar-monthNames-11@", "@%calendar-monthNames-12@"],
	"%calendar": "@%calendar@",
	"%calendar-currentDay": "@%calendar-currentDay@",
	"%calendar-goToLink": "@%calendar-goToLink@",
	"%calendar-goToTitle": "@%calendar-goToTitle@",
	"%calendar-goToMonth": "@%calendar-goToMonth@",
	"%calendar-goToYear": "@%calendar-goToYear@",
	"%calendar-goToButton": "@%calendar-goToButton@",
	"%calendar-cancelButton": "@%calendar-cancelButton@",
	"%calendar-previousMonth": "@%calendar-previousMonth@",
	"%calendar-nextMonth": "@%calendar-nextMonth@",
	/* Slideout */
	"%show-toc": "@%show-toc@",
	"%show-text": "@%show-text@",
	"%hide-text": "@%hide-text@",
	"%table-contents": "@%table-contents@",
	/* Lightbox */
	"%lb-current": "@%lb-current@",
	"%lb-next": "@%lb-next@",
	"%lb-prev": "@%lb-prev@",
	"%lb-xhr-error": "@%lb-xhr-error@",
	"%lb-img-error": "@%lb-img-error@",
	"%lb-slideshow": "@%lb-slideshow@",
	/* jQuery Mobile */
	"%jqm-expand": "@%jqm-expand@",
	"%jqm-collapse": "@%jqm-collapse@",
	"%jqm-clear-search": "@%jqm-clear-search@",
	"%jqm-filter": "@%jqm-filter@",
	"%jqm-tbl-col-toggle": "@%jqm-tbl-col-toggle@",
	/* Charts widget */
	"%table-mention": "@%table-mention@",
	"%table-following": "@%table-following@",
	/* Session timeout */
	"%st-timeout-msg": "@%st-timeout-msg@",
	"%st-msgbox-title": "@%st-msgbox-title@",
	"%st-already-timeout-msg": "@%st-already-timeout-msg@",
	/* Toggle details */
	"%td-toggle": "@%td-toggle@",
	"%td-open": "@%td-open@",
	"%td-close": "@%td-close@",
	"%td-ttl-open": "@%td-ttl-open@",
	"%td-ttl-close": "@%td-ttl-close@",
	/* Table enhancement */
	"%sSortAscending": "@%sSortAscending@",
	"%sSortDescending": "@%sSortDescending@",
	"%sEmptyTable": "@%sEmptyTable@",
	"%sInfo": "@%sInfo@",
	"%sInfoEmpty": "@%sInfoEmpty@",
	"%sInfoFiltered": "@%sInfoFiltered@",
	"%sInfoThousands": "@%sInfoThousands@",
	"%sLengthMenu": "@%sLengthMenu@",
	/* Geomap */
	"%geo-mapcontrol": "@%geo-mapcontrol@",
	"%geo-zoomin": "@%geo-zoomin@",
	"%geo-zoomout": "@%geo-zoomout@",
	"%geo-zoomworld": "@%geo-zoomworld@",
	"%geo-zoomfeature": "@%geo-zoomfeature@",
	"%geo-scaleline": "@%geo-scaleline@",
	"%geo-mouseposition": "@%geo-mouseposition@",
	"%geo-ariamap": "@%geo-ariamap@",
	"%geo-accessibilize": "@%geo-accessibilize@",
	"%geo-accessibilizetitle": "@%geo-accessibilizetitle@",
	"%geo-togglelayer": "@%geo-togglelayer@",
	"%geo-hiddenlayer": "@%geo-hiddenlayer@",
	"%geo-basemapurl": "@%geo-basemapurl@",
	"%geo-basemaptitle": "@%geo-basemaptitle@",
	"%geo-basemapurltxt": "@%geo-basemapurltxt@",
	"%geo-attributionlink": "@%geo-attributionlink@",
	"%geo-attributiontitle": "@%geo-attributiontitle@",
	"%geo-select": "@%geo-select@",
	"%geo-labelselect": "@%geo-labelselect@",
	/* Disable/enable WET plugins and polyfills */
	"%wb-disable": "@%wb-disable@",
	"%wb-enable": "@%wb-enable@"
},
	i18n = function(key, state, mixin) {

		var truthiness = (typeof key === "string" && key !== "") | // eg. 000 or 001 ie. 0 or 1
		(typeof state === "string" && state !== "") << 1 | // eg. 000 or 010 ie. 0 or 2
		(typeof mixin === "string" && mixin !== "") << 2; // eg. 000 or 100 ie. 0 or 4

		switch (truthiness) {
			case 1:
				return ind[key]; // only key was provided.
			case 3:
				return ind[key][state]; // key and state were provided.
			case 7:
				return ind[key][state].replace("[MIXIN]", mixin); // key, state, and mixin were provided.
			default:
				return "";
		}
	};

window.i18n = i18n;

}(window));

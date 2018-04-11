/*
 * Web Experience Toolkit (WET) / Boîte à outils de l"expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
/*
----- @lang-en@ dictionary (il8n) ---
 */
( function( wb ) {
"use strict";

/* main index */
wb.i18nDict = {
	"lang-code": "@lang-code@",
	"lang-native": "@lang-native@",
	add: "@add@",
	all: "@all@",
	tphp: "@tphp@",
	load: "@load@",
	process: "@process@",
	srch: "@srch@",
	"no-match": "@no-match@",
	matches: {
		mixin: "@matches@"
	},
	current: "@current@",
	hide: "@hide@",
	err: "@err@",
	colon: "@colon@",
	hyphen: "@hyphen@",
	"full-stop": "@full-stop@",
	"comma-space": "@comma-space@",
	space: "@space@",
	start: "@start@",
	stop: "@stop@",
	back: "@back@",
	cancel: "@cancel@",
	"min-ago": "@min-ago@",
	"coup-mins": "@coup-mins@",
	"mins-ago": {
		mixin: "@mins-ago@"
	},
	"hour-ago": "@hour-ago@",
	"hours-ago": {
		mixin: "@hours-ago@"
	},
	"days-ago": {
		mixin: "@days-ago@"
	},
	yesterday: "@yesterday@",

	nxt: "@nxt@",
	"nxt-r": "@nxt-r@",
	prv: "@prv@",
	"prv-l": "@prv-l@",
	first: "@first@",
	last: "@last@",
	page: "@page@",
	"srch-menus": "@srch-menus@",
	email: "@email@",
	"menu-close": "@menu-close@",
	"overlay-close": "@overlay-close@",
	"esc-key": "@esc-key@",
	show: "@show@",

	/* Tabbed interface */
	"tab-rot": {
		off: "@tab-rot-off@",
		on: "@tab-rot-on@"
	},
	"tab-list": "@tab-list@",
	"tab-pnl-end1": "@tab-pnl-end1@",
	"tab-pnl-end2": "@tab-pnl-end2@",
	"tab-pnl-end3": "@tab-pnl-end3@",
	"tab-play": "@tab-play@",

	/* Multimedia player */
	"mmp-play": "@mmp-play@",
	pause: "@pause@",
	open: "@open@",
	close: "@close@",
	volume: "@volume@",
	mute: {
		on: "@mute-on@",
		off: "@mute-off@"
	},
	cc: {
		off: "@cc-off@",
		on: "@cc-on@"
	},
	"cc-err": "@cc-err@",
	adesc: {
		on: "@adesc-on@",
		off: "@adesc-off@"
	},
	pos: "@pos@",
	dur: "@dur@",

	/* Share widget */
	"shr-txt": "@shr-txt@",
	"shr-pg": "@shr-pg@",
	"shr-vid": "@shr-vid@",
	"shr-aud": "@shr-aud@",
	"shr-hnt": "@shr-hnt@",
	"shr-disc": "@shr-disc@",

	/* Form validation */
	"frm-nosubmit": "@frm-nosubmit@",
	"errs-fnd": "@errs-fnd@",
	"err-fnd": "@err-fnd@",

	/* Date picker */
	"date-hide": "@date-hide@",
	"date-show": "@date-show@",
	"date-sel": "@date-sel@",

	/* Calendar */
	days: [
		"@days-1@",
		"@days-2@",
		"@days-3@",
		"@days-4@",
		"@days-5@",
		"@days-6@",
		"@days-7@"
	],
	mnths: [
		"@mnths-1@",
		"@mnths-2@",
		"@mnths-3@",
		"@mnths-4@",
		"@mnths-5@",
		"@mnths-6@",
		"@mnths-7@",
		"@mnths-8@",
		"@mnths-9@",
		"@mnths-10@",
		"@mnths-11@",
		"@mnths-12@"
	],
	cal: "@cal@",
	"cal-format": "@cal-format@",
	currDay: "@currDay@",
	"cal-goToLnk": "@cal-goToLnk@",
	"cal-goToTtl": "@cal-goToTtl@",
	"cal-goToMnth": "@cal-goToMnth@",
	"cal-goToYr": "@cal-goToYr@",
	"cal-goToBtn": "@cal-goToBtn@",
	prvMnth: "@prvMnth@",
	nxtMnth: "@nxtMnth@",

	/* Lightbox */
	"lb-curr": "@lb-curr@",
	"lb-xhr-err": "@lb-xhr-err@",
	"lb-img-err": "@lb-img-err@",

	/* Charts widget */
	"tbl-txt": "@tbl-txt@",
	"tbl-dtls": "@tbl-dtls@",
	"chrt-cmbslc": "@chrt-cmbslc@",

	/* Session timeout */
	"st-to-msg-bgn": "@st-to-msg-bgn@",
	"st-to-msg-end": "@st-to-msg-end@",
	"st-msgbx-ttl": "@st-msgbx-ttl@",
	"st-alrdy-to-msg": "@st-alrdy-to-msg@",
	"st-btn-cont": "@st-btn-cont@",
	"st-btn-end": "@st-btn-end@",

	/* Toggle details */
	"td-toggle": "@td-toggle@",
	"td-open": "@td-open@",
	"td-close": "@td-close@",
	"td-ttl-open": "@td-ttl-open@",
	"td-ttl-close": "@td-ttl-close@",

	/* Table enhancement */
	sortAsc: "@sortAsc@",
	sortDesc: "@sortDesc@",
	emptyTbl: "@emptyTbl@",
	infoEntr: "@infoEntr@",
	infoEmpty: "@infoEmpty@",
	infoFilt: "@infoFilt@",
	info1000: "@info1000@",
	lenMenu: "@lenMenu@",
	filter: "@filter@",

	/* Geomap */
	"geo-mapctrl": "@geo-mapctrl@",
	"geo-zmin": "@geo-zmin@",
	"geo-zmout": "@geo-zmout@",
	"geo-zmwrld": "@geo-zmwrld@",
	"geo-zmfeat": "@geo-zmfeat@",
	"geo-sclln": "@geo-sclln@",
	"geo-msepos": "@geo-msepos@",
	"geo-ariamap": "@geo-ariamap@",
	"geo-ally": "@geo-ally@",
	"geo-allyttl": "@geo-allyttl@",
	"geo-tgllyr": "@geo-tgllyr@",
	"geo-hdnlyr": "@geo-hdnlyr@",
	"geo-bmapurl": "@geo-bmapurl@",
	"geo-bmapttl": "@geo-bmapttl@",
	"geo-bmapurltxt": "@geo-bmapurltxt@",
	"geo-attrlnk": "@geo-attrlnk@",
	"geo-attrttl": "@geo-attrttl@",
	"geo-sel": "@geo-sel@",
	"geo-lblsel": "@geo-lblsel@",
	"geo-locurl-geogratis": "@geo-locurl-geogratis@",
	"geo-loc-placeholder": "@geo-loc-placeholder@",
	"geo-loc-label": "@geo-loc-label@",
	"geo-aoi-north": "@geo-aoi-north@",
	"geo-aoi-east": "@geo-aoi-east@",
	"geo-aoi-south": "@geo-aoi-south@",
	"geo-aoi-west": "@geo-aoi-west@",
	"geo-aoi-instructions": "@geo-aoi-instructions@",
	"geo-aoi-btndraw": "@geo-aoi-btndraw@",
	"geo-aoi-btnclear": "@geo-aoi-btnclear@",
	"geo-geoloc-btn": "@geo-geoloc-btn@",
	"geo-geoloc-fail": "@geo-geoloc-fail@",
	"geo-geoloc-uncapable": "@geo-geoloc-uncapable@",
	"geo-lgnd-grphc": "@geo-lgnd-grphc@",

	/* Disable/enable WET plugins and polyfills */
	"wb-disable": "@wb-disable@",
	"wb-enable": "@wb-enable@",
	"disable-notice-h": "@disable-notice-h@",
	"disable-notice": "@disable-notice@",

	/* Dismissable content */
	"dismiss": "@dismiss@",

	/* Template */
	"tmpl-signin": "@tmpl-signin@",

	/* Filter */
	"fltr-lbl": "@fltr-lbl@",
	"fltr-info": "@fltr-info@"
};

} )( wb );

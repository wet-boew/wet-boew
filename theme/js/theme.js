/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
(function( $, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var $document = wb.doc,

	onXXSmallView = function() {
		return;
	},

	onXSmallView = function() {
		return;
	},

	onSmallView = function() {
		return;
	},

	onMediumView = function() {
		return;
	},

	onLargeView = function() {
		return;
	},

	onXLargeView = function() {
		return;
	};

$document.on( "xxsmallview.wb xsmallview.wb smallview.wb mediumview.wb largeview.wb xlargeview.wb", function( event ) {
	var eventType = event.type;

	switch ( eventType ) {

	case "xxsmallview":
		onXXSmallView();
		break;

	case "xsmallview":
		onXSmallView();
		break;

	case "smallview":
		onSmallView();
		break;

	case "mediumview":
		onMediumView();
		break;

	case "largeview":
		onLargeView();
		break;

	case "xlargeview":
		onXLargeView();
		break;
	}
});

})( jQuery, wb );

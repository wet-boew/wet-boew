/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
/*jshint unused: false*/
(function( $, wb ) {
"use strict";

wb.doc.on( "click vclick", "#overlay-open-btn", function( event ) {
	if ( event.stopPropagation ) {
		event.stopImmediatePropagation();
	} else {
		event.cancelBubble = true;
	}

	$( "#" + $( "#overlay-select" ).val() ).trigger( "open.wb-overlay" );
});

})( jQuery, wb );

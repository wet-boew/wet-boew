/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
/*jshint unused: false*/
(function( $, wb ) {
"use strict";

wb.doc.on( "click vclick", ".modal-close", function( event ) {
	$( event.currentTarget )
			.closest( ".wb-overlay" )
				.trigger( "close.wb-overlay" );
});

})( jQuery, wb );

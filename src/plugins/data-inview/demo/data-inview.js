/**
 * @title WET-BOEW Data InView example
 * @overview Handles the Data InView view state change events and updates the status on the page.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET Community
 */
(function( $, wb ) {
"use strict";

wb.doc.on( "all.wb-inview partial.wb-inview none.wb-inview", function( event) {
	if ( event.namespace === "wb-inview" ) {
		$( event.target ).find( ".view-state-status" ).html( event.type );
	}
});

})( jQuery, wb );

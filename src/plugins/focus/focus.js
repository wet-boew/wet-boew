/*
 * @title WET-BOEW Focus
 * @overview User agent safe way of assigning focus to an element
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
(function( $, vapour ) {
"use strict";

// Bind the focus event
vapour.doc.on( "focus.wb", function ( event ) {
	var eventTarget = event.target;

	// Ignore focus events that are not in the wb namespace and
	// filter out any events triggered by descendants
	if ( event.namespace === "wb" && event.currentTarget === eventTarget ) {

		// Assigns focus to an element
		setTimeout(function () {
			return $( eventTarget ).focus();
		}, 0 );
	}
});

})( jQuery, vapour );

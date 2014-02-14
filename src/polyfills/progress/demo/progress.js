/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
/*jshint unused: false*/
(function( $, wb ) {
"use strict";

wb.doc.on( "click vclick", "#updateProgress", function() {
	var $elm = $( "#updateTest" ),
		valuenow = parseInt( $elm.attr( "value" ), 10 ),
		newValue = valuenow === parseInt( $elm.attr( "max" ), 10 ) ? 0 : valuenow + 1;

	$elm
		.attr( "value", newValue )
		.find( "span" )
			.text( newValue + "%" );

	// Update the visuals
	$elm.trigger( "wb-update.wb-progress" );
});

})( jQuery, wb );

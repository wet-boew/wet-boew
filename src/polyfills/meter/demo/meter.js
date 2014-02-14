/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
/*jshint unused: false*/
(function( $, wb ) {
"use strict";

wb.doc.on( "click vclick", "#increaseMeter, #decreaseMeter", function( event ) {
	var $elm = $( "#updateTest" ),
		increase = event.currentTarget.id === "increaseMeter",
		valuenow = parseInt( $elm.attr( "value" ), 10 ),
		limit = parseInt( $elm.attr( increase ? "max" : "min" ), 10 ),
		change = increase ? 1 : -1,
		newValue = valuenow === limit ? 0 : valuenow + change;

	$elm
		.attr( "value", newValue )
		.find( "span" )
			.text( newValue );

	// Update the visuals
	$elm.trigger( "wb-update.wb-meter" );
});

})( jQuery, wb );

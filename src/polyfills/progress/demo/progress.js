/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
/*jshint unused: false*/
(function( $, vapour ) {
"use strict";

vapour.doc.on( "click vclick", "#updateProgress", function() {
	var $elm = $( "#updateTest" ),
		valuenow = parseInt( $elm.attr( "value" ), 10 ),
		newValue = valuenow === parseInt( $elm.attr( "max" ) ) ? 0 : valuenow + 1;

	$elm.attr( "value", newValue );
	$elm.find( "span" ).text( newValue + "%" );
});

})( jQuery, vapour );

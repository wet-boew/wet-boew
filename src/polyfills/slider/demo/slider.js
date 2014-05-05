/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
(function( $, document, wb ) {
"use strict";

var currentValueString = document.documentElement.lang === "fr" ?
		"Valeur actuelle&#160;:" :
		"Current Value:",
		$document = wb.doc,
		$slider;

$document.on( "change", "#html5shim-1, #html5shim-2", function( event ) {
	document
		.getElementById( event.target.id + "-out" )
			.innerHTML = "(" + currentValueString + " " + this.value + ")";
});

$document.one( "timerpoke.wb", function() {
	$slider = $( "<input name='html5shim-3' id='html5shim-3' type='range' value='50'/>" );
	$slider.appendTo( "#slider-prg" ).trigger( "wb-init.wb-slider" );
	setTimeout( function() {
		$slider.get( 0 ).value = 85;
		$slider.trigger( "wb-update.wb-slider" );
	}, 2000);
});

})( jQuery, document, wb );

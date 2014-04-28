/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
(function( $, document, wb ) {
"use strict";

var currentValueString = document.documentElement.lang === "fr" ?
		"Valeur actuelle&#160;:" :
		"Current Value:";

wb.doc.on( "change", "#html5shim-1, #html5shim-2", function( event ) {
	document
		.getElementById( event.target.id + "-out" )
			.innerHTML = "(" + currentValueString + " " + this.value + ")";
});

})( jQuery, document, wb );

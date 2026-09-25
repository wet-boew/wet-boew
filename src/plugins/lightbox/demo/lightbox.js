/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
/*jshint unused: false*/
( function( $, wb ) {
"use strict";

var $document = wb.doc;

$document.on( "click", "#lbx-open-btn", function() {
	var value = $( "#lbx-select" ).val();

	if ( value === "1" ) {
		$document.trigger( "open.wb-lbx", [
			[
				{
					src: "https://dummyimage.com/612x612/2e5274/FFF.jpg&text=Image+1",
					type: "image"
				}
			],
			false,
			[
				"Image 1"
			]
		] );
	} else if ( value === "2" ) {
		$document.trigger( "open.wb-lbx", [
			[
				{
					src: "ajax/ajax1-en.html",
					type: "ajax"
				}
			]
		] );
	} else if ( value === "3" ) {
		$document.trigger( "open.wb-lbx", [
			[
				{
					src: "#inline_content",
					type: "inline"
				}
			]
		] );
	} else if ( value === "4" ) {
		$document.trigger( "open.wb-lbx", [
			[
				{
					src: "#inline_content_modal",
					type: "inline"
				}
			],
			true
		] );
	} else if ( value === "5" ) {
		$document.trigger( "open.wb-lbx", [
			[
				{
					src: "https://dummyimage.com/612x612/2e5274/FFF.jpg&text=Image+1",
					type: "image"
				}, {
					src: "https://dummyimage.com/612x612/2e5274/FFF.jpg&text=Image+2",
					type: "image"
				}, {
					src: "https://dummyimage.com/612x612/2e5274/FFF.jpg&text=Image+3",
					type: "image"
				}
			],
			false,
			[
				"Image 1",
				"Image 2",
				"Image 3"
			]
		] );
	}
} );

} )( jQuery, wb );

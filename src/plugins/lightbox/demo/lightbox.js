/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
/*jshint unused: false*/
(function( $, wb ) {
"use strict";

wb.doc.on( "click vclick", "#lbx-open-btn", function( event ) {
	var value = $( "#lbx-select" ).val();

	if ( value === "1" ) {
		wb.doc.trigger( "open.wb-lbx", [
			[
				{
					src: "demo/1_b.jpg",
					type: "image"
				}
			],
			false,
			[
				"Image 1"
			]
		]);
	} else if ( value === "2" ) {
		wb.doc.trigger( "open.wb-lbx", [
			[
				{
					src: "ajax/ajax1-en.html",
					type: "ajax"
				}
			]
		]);
	} else if ( value === "3" ) {
		wb.doc.trigger( "open.wb-lbx", [
			[
				{
					src: "#inline_content",
					type: "inline"
				}
			]
		]);
	} else if ( value === "4" ) {
		wb.doc.trigger( "open.wb-lbx", [
			[
				{
					src: "#inline_content_modal",
					type: "inline"
				}
			],
			true
		]);
	} else if ( value === "5" ) {
		wb.doc.trigger( "open.wb-lbx", [
			[
				{
					src: "demo/1_b.jpg",
					type: "image"
				}, {
					src: "demo/2_b.jpg",
					type: "image"
				}, {
					src: "demo/3_b.jpg",
					type: "image"
				}
			],
			false,
			[
				"Image 1",
				"Image 2",
				"Image 3"
			]
		]);
	}
});

})( jQuery, wb );

/**
 * @title WET-BOEW slider polyfill wrapper
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @LaurentGoderre
 */
(function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the polyfill - meaning that they will be initialized once per page.
 */
var polyfillName = "wb-slider",
	selector = "input",
	initEvent = "wb-init." + polyfillName,
	updateEvent = "wb-update." + polyfillName;

// Bind the init and update event of the plugin
wb.doc.on( initEvent + " " + updateEvent, selector, function( event ) {
	var eventTarget = event.target;

	if ( event.currentTarget === eventTarget ) {
		switch ( event.type ) {
		case "wb-init":
			window.fdSlider.createSlider( {
				inp: eventTarget
			});
			break;
		case "wb-update":
			window.fdSlider.updateSlider( eventTarget.id );
		}
	}
});

})( jQuery, window, wb );

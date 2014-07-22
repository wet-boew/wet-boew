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
	selector = "input[type='range']",
	initEvent = "wb-init." + polyfillName,
	updateEvent = "wb-update." + polyfillName,
	uniqueCount = 0;

// Bind the init and update event of the plugin
wb.doc.on( initEvent + " " + updateEvent, selector, function( event ) {
	var eventTarget = event.target,
		$target;

	if ( event.currentTarget === eventTarget ) {
		switch ( event.type ) {
		case "wb-init":

			if ( !eventTarget.id ) {
				eventTarget.id = "wb-sldr-" + ( uniqueCount++ );
			}

			window.fdSlider.createSlider( {
				inp: eventTarget,
				html5Shim: true
			});

			// Allows listening for input and change at the document level for IE < 9
			if ( wb.ielt9 ) {
				$target = $( eventTarget );
				$target.on( "input change", function( event ) {
					$target.closest( "[class^='wb-'], body" ).trigger ( event );
				});
			}
			break;

		case "wb-update":
			if ( event.namespace === polyfillName ) {
				window.fdSlider.updateSlider( eventTarget.id );
			}
		}
	}
});

})( jQuery, window, wb );

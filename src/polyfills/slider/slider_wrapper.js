/**
 * @title WET-BOEW slider polyfill wrapper
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @LaurentGoderre
 */
( function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the polyfill - meaning that they will be initialized once per page.
 */
var componentName = "wb-slider",
	selector = "input[type='range']",
	initEvent = "wb-init." + componentName,
	updateEvent = "wb-update." + componentName,
	uniqueCount = 0,

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var eventTarget = wb.init( event, componentName, selector ),
			$eventTarget;

		if ( eventTarget ) {
			if ( !eventTarget.id ) {
				eventTarget.id = "wb-sldr-" + ( uniqueCount++ );
			}

			window.fdSlider.createSlider( {
				inp: eventTarget,
				html5Shim: true
			} );

			// Allows listening for input and change at the document level for IE < 9
			if ( wb.ielt9 ) {
				$eventTarget = $( eventTarget );
				$eventTarget.on( "input change", function( event ) {
					$eventTarget.closest( "[class^='wb-'], body" ).trigger( event );
				} );
			}

			// Identify that initialization has completed
			wb.ready( $eventTarget, componentName );
		}
	};

// Bind the init and update event of the plugin
wb.doc.on( initEvent + " " + updateEvent, selector, function( event ) {
	var eventTarget = event.target;

	if ( event.currentTarget === eventTarget ) {
		switch ( event.type ) {
		case "wb-init":
			init( event );
			break;

		case "wb-update":
			if ( event.namespace === componentName ) {
				window.fdSlider.updateSlider( eventTarget.id );
				$( eventTarget ).trigger( "wb-updated." + componentName );
			}
		}
	}
} );

} )( jQuery, window, wb );

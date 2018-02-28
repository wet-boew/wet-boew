/**
 * @title WET-BOEW Collapsible alerts plugin
 * @overview Collapsible alerts (details/summary)
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET community
 */
( function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the event - meaning that they will be initialized once per page,
 * not once per instance of event on the page.
 */
var componentName = "wb-collapsible",
	selector = "details.alert",
	initEvent = "wb-init." + componentName,
	$document = wb.doc,
	key,

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var details = wb.init( event, componentName, selector ),
			$details;

		if ( details ) {
			$details = $( details );

			key = "alert-collapsible-state-" + details.getAttribute( "id" );

			try {
				if ( localStorage.getItem( key ) ) {

					// Set open/closed state for existing localStorage keys
					if ( localStorage.getItem( key ) === "open" ) {
						details.setAttribute( "open", "open" );
						details.className += " open";
					} else if ( localStorage.getItem( key ) === "closed" ) {
						details.removeAttribute( "open" );
						details.className = details.className.replace( " open", "" );
					}

				} else {

					// Set new localStorage values
					if ( details.hasAttribute( "open" ) ) {
						localStorage.setItem( key, "open" );
					} else {
						localStorage.setItem( key, "closed" );
					}

				}
			} catch ( e ) {}

			// Identify that initialization has completed
			wb.ready( $details, componentName );
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Do not bind events if details polyfill is active
if ( Modernizr.details ) {

	// Bind the the event handlers of the plugin
	$document.on( "click keydown toggle." + componentName, selector + " summary", function( event ) {
		var which = event.which,
			currentTarget = event.currentTarget,
			isClosed,
			details;

		// Ignore middle/right mouse buttons and wb-toggle enhanced summary elements (except for toggle)
		if ( ( !which || which === 1 ) &&
			( currentTarget.className.indexOf( "wb-toggle" ) === -1 ||
			( event.type === "toggle" && event.namespace === componentName ) ) ) {

			details = currentTarget.parentNode;
			isClosed = details.getAttribute( "open" ) === null;
			key = "alert-collapsible-state-" + details.getAttribute( "id" );

			if ( isClosed ) {
				try {
					localStorage.setItem( key, "open" );
				} catch ( e ) {}
			} else {
				try {
					localStorage.setItem( key, "closed" );
				} catch ( e ) {}
			}
		} else if ( which === 13 || which === 32 ) {
			event.preventDefault();
			$( currentTarget ).trigger( "click" );
		}

		/*
		 * Since we are working with events we want to ensure that we are being passive about our control,
		 * so returning true allows for events to always continue
		 */
		return true;
	} );
}

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, wb );

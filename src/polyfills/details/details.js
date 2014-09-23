/**
 * @title WET-BOEW Details/summary polyfill
 * @overview The <details> and <summary> elements allows content to be expanded and collapsed.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
(function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the polyfill - meaning that they will be initialized once per page.
 */
var componentName = "wb-details",
	selector = "summary",
	initEvent = "wb-init." + componentName,
	$document = wb.doc,

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var summary = wb.init( event, componentName, selector ),
			details;

		if ( summary ) {
			details = summary.parentNode;
			summary.setAttribute( "aria-expanded", ( details.getAttribute( "open" ) !== null ) );

			if ( !summary.getAttribute( "role" ) ) {
				summary.setAttribute( "role", "button" );
			}
			if ( !summary.getAttribute( "tabindex" ) ) {
				summary.setAttribute( "tabindex", "0" );
			}

			// Identify that initialization has completed
			wb.ready( $( summary ), componentName );
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Bind the the event handlers of the plugin
$document.on( "click keydown toggle." + componentName, selector, function( event ) {
	var which = event.which,
		currentTarget = event.currentTarget,
		details, isClosed, key;

	// Ignore middle/right mouse buttons and wb-toggle enhanced summary elements (except for toggle)
	if ( ( !which || which === 1 ) &&
		( currentTarget.className.indexOf( "wb-toggle" ) === -1 ||
		( event.type === "toggle" && event.namespace === componentName ) ) ) {

		details = currentTarget.parentNode;
		isClosed = details.getAttribute( "open" ) === null ;

		if ( details.className.indexOf( "alert" ) !== -1 ) {
			key = "alert-collapsible-state-" + details.getAttribute( "id" );
		}

		if ( isClosed ) {
			details.setAttribute( "open", "open" );
			details.className += " open";
			if ( key ) {
				try {
					localStorage.setItem( key, "open" );
				} catch ( e ) {}
			}
		} else {
			details.removeAttribute( "open" );
			details.className = details.className.replace( " open", "" );
			if ( key ) {
				try {
					localStorage.setItem( key, "closed" );
				} catch ( e ) {}
			}
		}
		currentTarget.setAttribute( "aria-expanded", isClosed );
	} else if ( which === 13 || which === 32 ) {
		event.preventDefault();
		$( currentTarget ).trigger( "click" );
	}

	/*
	 * Since we are working with events we want to ensure that we are being passive about our control,
	 * so returning true allows for events to always continue
	 */
	return true;
});

// Add the timer poke to initialize the plugin
wb.add( selector );

})( jQuery, window, wb );

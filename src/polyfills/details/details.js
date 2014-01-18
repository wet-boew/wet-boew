/**
 * @title WET-BOEW Details/summary polyfill
 * @overview The <details> and <summary> elements allows content to be expanded and collapsed.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
(function( window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the polyfill - meaning that they will be initialized once per page.
 */
var pluginName = "wb-details",
	selector = "summary",
	initedClass = pluginName + "-inited",
	initEvent = "wb-init." + pluginName,
	$document = wb.doc,

	/**
	 * Init runs once per polyfill element on the page. There may be multiple elements.
	 * It will run more than once if you don't remove the selector from the timer.
	 * @method init
	 * @param {jQuery event} event The event that triggered init
	 */
	init = function( event ) {
		var summary = event.currentTarget,
			details = summary.parentNode;

		// Filter out any events triggered by descendants
		// and only initialize the element once
		if ( summary === event.target &&
			details.className.indexOf( initedClass ) === -1 ) {

			wb.remove( selector );
			details.className += " " + initedClass;

			details.setAttribute( "aria-expanded", ( details.getAttribute( "open" ) !== null ) );
			summary.setAttribute( "tabindex", "0" );
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Bind the the event handlers of the plugin
$document.on( "click keydown toggle.wb-details", selector, function( event ) {
	var which = event.which,
		currentTarget = event.currentTarget,
		details, isClosed;

	// Ignore middle/right mouse buttons and wb-toggle enhanced summary elements (except for toggle)
	if ( ( !which || which === 1 ) &&
		( currentTarget.className.indexOf( "wb-toggle" ) === -1 || event.type === "toggle" ) ) {

		details = currentTarget.parentNode;
		isClosed = ( details.getAttribute( "open" ) === null );

		if ( isClosed ) {
			details.setAttribute( "open", "open" );
			details.className += " open";
		} else {
			details.removeAttribute( "open" );
			details.className = details.className.replace( " open", "" );
		}
		details.setAttribute( "aria-expanded", isClosed );
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

})( window, wb );

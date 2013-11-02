/*
 * @title WET-BOEW Details/summary polyfill
 * @overview The <details> and <summary> elements allows content to be expanded and collapsed.
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
(function( window, vapour ) {
"use strict";

/* 
 * Variable and function definitions. 
 * These are global to the polyfill - meaning that they will be initialized once per page.
 */
var selector = "details",
	$document = vapour.doc,

	/*
	 * Init runs once per polyfill element on the page. There may be multiple elements. 
	 * It will run more than once if you don't remove the selector from the timer.
	 * @method init
	 * @param {DOM element} _input The input field to be polyfilled
	 */
	init = function( _elm ) {
		var summary;

		// All plugins need to remove their reference from the timer in the init sequence unless they have a requirement to be poked every 0.5 seconds
		window._timer.remove( selector );

		_elm.setAttribute( "aria-expanded", ( _elm.getAttribute( "open" ) === null ) );
		summary = _elm.getElementsByTagName( "summary" );
		if ( summary.length !== 0 ) {
			summary[ 0 ].setAttribute( "tabindex", "0" );
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb", selector, function( event ) {
	init( event.target );

	/*
	 * Since we are working with events we want to ensure that we are being passive about our control, 
	 * so returning true allows for events to always continue
	 */
	return true;
});

// Bind the init event of the plugin
$document.on( "click vclick touchstart keydown", selector + " summary", function( event ) {
	var eventWhich = event.which,
		_details, _isClosed;

	// Ignore middle/right mouse buttons
	if ( !eventWhich || eventWhich === 1 || eventWhich === 13 || eventWhich === 32 ) {
		_details = event.target.parentNode;
		_isClosed = ( _details.getAttribute( "open" ) === null );
		
		if ( _isClosed ) {
			_details.setAttribute( "open", "open" );
		} else {
			_details.removeAttribute( "open" );
		}
		_details.setAttribute( "aria-expanded", _isClosed );

		return false;
	}

	/*
	 * Since we are working with events we want to ensure that we are being passive about our control, 
	 * so returning true allows for events to always continue
	 */
	return true;
});

// Add the timer poke to initialize the plugin
window._timer.add( selector );

})( window, vapour );

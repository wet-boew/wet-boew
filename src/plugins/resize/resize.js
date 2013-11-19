/*
 * @title WET-BOEW Resize
 * @overview Text and window resizing event handler
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
(function( $, window, document, vapour ) {
"use strict";

/* 
 * Variable and function definitions. 
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var id = "wb-resize",
	selector = "#" + id,
	$window = vapour.win,
	$document = vapour.doc,
	sizes = [],
	events = [
		"text-resize.wb",
		"window-resize-width.wb",
		"window-resize-height.wb"
	],

	// Breakpoint names and lower pixel limits
	breakpoints = {
		xxsmallview: 0,
		xsmallview: 480,
		smallview: 768,
		mediumview: 992,
		largeview: 1200,
		xlargeview: 1600
	},
	initialized = false,
	eventsAll, resizeTest, currentView,

	/*
	 * Init runs once
	 * @method init
	 */
	init = function() {
		var localResizeTest = document.createElement( "span" );

		// Set up the DOM element used for resize testing
		localResizeTest.innerHTML = "&#160;";
		localResizeTest.setAttribute( "id", id );
		document.body.appendChild( localResizeTest );
		resizeTest = localResizeTest;

		// Get a snapshot of the current sizes
		sizes = [
			localResizeTest.offsetHeight,
			$window.width(),
			$window.height()
		];

		// Create a string containing all the events
		eventsAll = events.join( " " );

		// Determine the current view
		viewChange( sizes[ 1 ] );

		initialized = true;
	},

	viewChange = function ( viewportWidth ) {
		var breakpoint;

		// Check for a change between views
		for ( breakpoint in breakpoints ) {

			// Determine the current view
			if ( viewportWidth < breakpoints[ breakpoint ] ) {

				// Determine if the current view is different the previous view
				if ( breakpoint !== currentView ) {

					// Change the breakpoint class on the html element
					vapour.html
						.removeClass( currentView )
						.addClass( breakpoint );

					// Update the current breakpoint
					currentView = breakpoint;

					// Trigger the breakpoint event
					$document.trigger( breakpoint + ".wb" );
				}
				break;
			}
		}
	},

	/*
	 * Tests for text size, window width and window height changes and triggers an event when a change is found
	 * @method test
	 */
	test = function() {
		if ( initialized ) {
			var currentSizes = [
					resizeTest.offsetHeight,
					$window.width(),
					$window.height()
				],
				len = currentSizes.length,
				i;

			// Check for a viewport or text size change
			for ( i = 0; i !== len; i += 1 ) {
				if ( currentSizes[ i ] !== sizes[ i ] ) {

					// Change detected so trigger related event
					$document.trigger( events[ i ], currentSizes );

					// Check for a view change
					viewChange( currentSizes[ 1 ] );
				}
			}
			sizes = currentSizes;
			return;
		}
	};
	
// Re-test on each timerpoke
$document.on( "timerpoke.wb", selector, test );

// Initialize the resources
init();

// Add the timer poke to initialize the plugin
window._timer.add( selector );

})( jQuery, window, document, vapour );

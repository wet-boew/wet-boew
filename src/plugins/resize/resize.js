/*
 * @title WET-BOEW Resize
 * @overview Text and window resizing event handler
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
(function ( $, window, document, vapour ) {
	"use strict";

    /* 
     * Variable and function definitions. 
     * These are global to the plugin - meaning that they will be initialized once per page,
     * not once per instance of plugin on the page. So, this is a good place to define
     * variables that are common to all instances of the plugin on a page.
     */
	var id = "wb-resize-test",
		selector = "#" + id,
		$window = vapour.win,
		$document = vapour.doc,
		sizes= [ ],
		events = [
			"text-resize.wb",
			"window-resize-width.wb",
			"window-resize-height.wb"
		],
		eventsAll, resizeTest,

        /*
         * Init runs once per plugin element on the page. There may be multiple elements. 
         * @method init
         */
		init = function () {
			var _resizeTest = document.createElement( "span" );

			// Set up the DOM element used for resize testing
			_resizeTest.innerHTML = "&#160;";
			_resizeTest.setAttribute( "id", id );
			document.body.appendChild( _resizeTest );
			resizeTest = _resizeTest;

			// Get a snapshot of the current sizes
			sizes = [
				_resizeTest.offsetHeight,
				$window.width(),
				$window.height()
			];

			// Create a string containing all the events
			eventsAll = events.join( " " );
		},

        /*
         * Tests for text size, window width and window height changes and triggers an event when a change is found
         * @method test
         */
		test = function () {
			var currentSizes = [
					resizeTest.offsetHeight,
					$window.width(),
					$window.height()
				],
				i,
				len = currentSizes.length;

			for ( i = 0; i !== len; i += 1 ) {
				if ( currentSizes[ i ] !== sizes[ i ] ) {
					$document.trigger( events[ i ], currentSizes );
				}
			}
			sizes = currentSizes;
			return;
		};

	// Initialize the handler resources
	init();
		
	// Re-test on each timerpoke
	$document.on( "timerpoke.wb", selector, test );

    // Add the timer poke to initialize the plugin
    window._timer.add( selector );

} )( jQuery, window, document, vapour );

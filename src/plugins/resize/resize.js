/*
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 */
/*
 * WET-BOEW text and window resizing event handler
 */
(function ( $, window, document, vapour ) {
	"use strict";

	var id = "wb-resize-test",
		selector = "#" + id,
		$window = vapour.win,
		$document = vapour.doc,
		plugin = {
			sizes: [],
			events: [
				"text-resize.wb",
				"window-resize-width.wb",
				"window-resize-height.wb"
			],
			eventsAll: null,
			resizeTest: null,

			// Sets up the resize testing
			init: function() {
				var _resizeTest = document.createElement( "span" );

				// Set up the DOM element used for resize testing
				_resizeTest.innerHTML = "&#160;";
				_resizeTest.setAttribute( "id", id );
				document.body.appendChild( _resizeTest );
				plugin.resizeTest = _resizeTest;

				// Get a snapshot of the current sizes
				plugin.sizes = [
					_resizeTest.offsetHeight,
					$window.width(),
					$window.height()
				];

				// Create a string containing all the events
				plugin.eventsAll = plugin.events.join( " " );
			},

			// Tests for text size, window width and window height changes and triggers an event when a change is found
			test: function() {
				var currentSizes = [
						plugin.resizeTest.offsetHeight,
						$window.width(),
						$window.height()
					],
					i,
					len = currentSizes.length;

				for ( i = 0; i !== len; i += 1 ) {
					if ( currentSizes[ i ] !== plugin.sizes[ i ] ) {
						$document.trigger( plugin.events[ i ], currentSizes );
					}
				}
				plugin.sizes = currentSizes;
				return;
			}
		};

	// Initialize the handler resources
	plugin.init();
		
	// Re-test on each timerpoke
	$document.on( "timerpoke.wb", selector, plugin.test);

	// Add the timer poke to initialize the plugin
	window._timer.add( selector );
})( jQuery, window, document, vapour );
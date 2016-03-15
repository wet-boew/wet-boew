/**
 * @title WET-BOEW Resize
 * @overview Text and window resizing event handler
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @pjackson28
 */
( function( $, window, document, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var componentName = "wb-rsz",
	selector = "#" + componentName,
	initEvent = "wb-init" + selector,
	$document = wb.doc,
	sizes = [],
	events = [
		"txt-rsz.wb",
		"win-rsz-width.wb",
		"win-rsz-height.wb"
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
	resizeTest, currentView,

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( event, componentName, selector ),
			localResizeTest;

		if ( elm ) {

			// Set up the DOM element used for resize testing
			localResizeTest = document.createElement( "span" );
			localResizeTest.innerHTML = "&#160;";
			localResizeTest.setAttribute( "id", componentName );
			document.body.appendChild( localResizeTest );
			resizeTest = localResizeTest;

			// Get a snapshot of the current sizes
			sizes = [
				localResizeTest.offsetHeight,
				window.innerWidth || $document.width(),
				window.innerHeight || $document.height()
			];

			// Determine the current view
			viewChange( sizes[ 1 ] );

			// Identify that initialization has completed
			wb.ready( $document, componentName );
		}
	},

	viewChange = function( viewportWidth ) {
		var breakpoint, viewName;

		// Check for a change between views
		for ( breakpoint in breakpoints ) {

			// Determine the current view
			if ( viewportWidth < breakpoints[ breakpoint ] ) {
				break;
			} else {
				viewName = breakpoint;
			}
		}

		// Determine if the current view is different than the previous view
		if ( viewName !== currentView ) {

			// Change the breakpoint class on the html element
			wb.html
				.removeClass( currentView || "" )
				.addClass( viewName );

			// Update the current view
			currentView = viewName;

			// Trigger the view event
			$document.trigger( viewName + ".wb" );
		}
	},

	/**
	 * Tests for text size, window width and window height changes and triggers an event when a change is found
	 * @method test
	 */
	test = function() {
		var currentSizes = [
				resizeTest.offsetHeight,
				window.innerWidth || $document.width(),
				window.innerHeight || $document.height()
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
	};

// Bind the init event to the plugin
$document.on( initEvent, init );

// Re-test on each timerpoke
$document.on( "timerpoke.wb", selector, test );

// Initialize the resources
$document.trigger( initEvent );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, document, wb );

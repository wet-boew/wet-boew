/**
 * @title WET-BOEW Details closed on small screen
 * @overview Closes details on defined viewport and down if they were not engaged, default is small
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @thomasgohard
 */
( function( $, wb ) {
"use strict";

/*
* Variable and function definitions.
* These are global to the plugin - meaning that they will be initialized once per page,
* not once per instance of plugin on the page. So, this is a good place to define
* variables that are common to all instances of the plugin on a page.
*/
const componentName = "wb-details-close",
	selector = "." + componentName,
	initEvent = "wb-init" + selector,
	$document = wb.doc,
	views = [ "xxs", "xs", "sm", "md", "lg", "xl" ],
	viewsClasses = [ "xxsmallview", "xsmallview", "smallview", "mediumview", "largeview", "xlargeview" ],

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		let elm = wb.init( event, componentName, selector );

		if ( elm ) {
			let $elm = $( elm ),
				breakpoint = elm.dataset.breakpoint || "sm", // Get the target breakpoint from data attribute or default to "sm"
				viewBreakpointIndex = views.indexOf( breakpoint ), // Get the index of the target breakpoint
				viewBreakpoint = viewsClasses.slice( 0, viewBreakpointIndex + 1 ), // Get the target and smaller view classes
				viewsSelector = "html." + viewBreakpoint.join( ", html." ); // Create a selector for the target and smaller views

			// If within the targetted views, keep details closed. If not, keep opened.
			if ( document.querySelector( viewsSelector ) ) {
				elm.removeAttribute( "open" );
			} else {
				elm.setAttribute( "open", "" );
			}

			wb.ready( $elm, componentName );
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, wb );

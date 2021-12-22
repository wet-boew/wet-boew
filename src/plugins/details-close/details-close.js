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
var componentName = "wb-details-close",
	selector = ".provisional." + componentName,
	initEvent = "wb-init" + selector,
	$document = wb.doc,
	views = [ "xxs", "xs", "sm", "md", "lg", "xl" ],
	viewsClass = [ "xxsmallview", "xsmallview", "smallview", "mediumview", "largeview", "xlargeview" ],
	breakpoint,

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( event, componentName, selector ),
			$elm, i;

		if ( elm ) {
			$elm = $( elm );

			// Get the plugin JSON configuration set on attribute data-wb-details-close
			// Will define one set settings for all .wb-details-close on the page
			breakpoint = $elm.data( "breakpoint" ) || "sm";

			// reset breakpoint if config is passed
			if ( views.length === viewsClass.length ) {
				i = views.indexOf( breakpoint );
				viewsClass = viewsClass.slice( 0, i + 1 );
			}

			hideOnBreakpoint();

			// Identify that initialization has completed
			wb.ready( $elm, componentName );
		}
	},

	/**
	 * Toggle details depending on breakpoint
	 * @method hideOnBreakpoint
	 * @param {jQuery DOM element | jQuery Event} $elm Element targetted by this plugin, which is the details
	 */
	hideOnBreakpoint = function() {
		var $elm = $( selector ),
			viewsSelector = "html." + viewsClass.join( ", html." );

		// If within the targetted views, keep details closed
		if ( $( viewsSelector ).length ) {
			$elm.removeAttr( "open" );
		} else {

			// If not, keep opened
			$elm.attr( "open", "" );
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, wb );

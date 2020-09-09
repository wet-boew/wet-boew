/**
 * @title eqht
 * @overview Provide ability to have equal height containers and nested containers inside a WET-BOEW grid
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author @luc-bertrand-hrsdc
 */
( function( $, window, wb ) {
"use strict";

/*
 * Variable and function definitions.
 * These are global to the plugin - meaning that they will be initialized once per page,
 * not once per instance of plugin on the page. So, this is a good place to define
 * variables that are common to all instances of the plugin on a page.
 */
var componentName = "wb-eqht-grd",
	selector = "." + componentName + " .eqht-trgt",
	initEvent = "wb-init" + selector,
	$document = wb.doc,

	/**
	 * @method init
	 * @param {jQuery Event} event Event that triggered the function call
	 */
	init = function( event ) {

		// Start initialization
		// returns DOM object = proceed with init
		// returns undefined = do not proceed with init (e.g., already initialized)
		var elm = wb.init( event, componentName, selector ),
			$elm,
			$eqhtParents;

		if ( elm ) {
			$elm = $( elm );
			$elm.addClass( "hght-inhrt" );
			$eqhtParents = $elm.parentsUntil( "[class*='" + componentName + "']" );
			$eqhtParents.addClass( "hght-inhrt" );

			// Identify that initialization has completed
			wb.ready( $elm, componentName );
		}
	};

// Bind the init event of the plugin
$document.on( "timerpoke.wb " + initEvent, selector, init );

// Add the timer poke to initialize the plugin
wb.add( selector );

} )( jQuery, window, wb );
